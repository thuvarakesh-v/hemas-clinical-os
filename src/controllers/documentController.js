const path = require('path');
const fs = require('fs');
const { Document, AIAnalysis, MedicalProfile, UserAllergy, UserCondition, Allergy, Condition } = require('../models');
function sanitizeUrgency(level) {
  const valid = ['routine', 'soon', 'urgent', 'emergency'];
  return valid.includes(level) ? level : 'routine';
}
const aiService = require('../services/aiService');
const { Op } = require('sequelize');

async function buildPatientContext(userId) {
  const profile = await MedicalProfile.findOne({ where: { user_id: userId } });
  const allergies = await UserAllergy.findAll({
    where: { user_id: userId },
    include: [{ model: Allergy, as: 'allergy', required: false }],
  });
  const conditions = await UserCondition.findAll({
    where: { user_id: userId, is_active: true },
    include: [{ model: Condition, as: 'condition', required: false }],
  });
  const recentAnalyses = await AIAnalysis.findAll({
    where: { patient_id: userId, analysis_type: 'document' },
    limit: 5,
    order: [['created_at', 'DESC']],
  });

  const dob = profile?.date_of_birth;
  const age = dob ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000)) : null;

  return {
    name: profile ? `${profile.first_name} ${profile.last_name}` : 'Patient',
    age,
    gender: profile?.gender,
    bloodGroup: profile?.blood_group,
    allergies: allergies.map(a => a.custom_allergy || a.allergy?.name).filter(Boolean),
    conditions: conditions.map(c => c.custom_condition || c.condition?.name).filter(Boolean),
    pastDocumentsSummary: recentAnalyses.map(a => a.summary).filter(Boolean).join(' | ').substring(0, 500),
    recentAnalyses: recentAnalyses.map(a => a.summary).filter(Boolean).join('; ').substring(0, 300),
  };
}

async function uploadDocument(req, res) {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  const userId = req.userId;
  const { category, documentDate, title, description } = req.body;

  const doc = await Document.create({
    patient_id: userId,
    uploaded_by_type: req.userRole === 'patient' ? 'patient' : req.userRole,
    uploaded_by_id: userId,
    original_name: req.file.originalname,
    filename: req.file.filename,
    file_path: `/uploads/documents/${req.file.filename}`,
    file_size: req.file.size,
    mime_type: req.file.mimetype,
    category: category || 'other',
    document_date: documentDate || new Date().toISOString().split('T')[0],
    title: title || req.file.originalname,
    description: description || null,
    is_ai_analyzed: false,
  });

  // Trigger async AI analysis for PDFs
  if (req.file.mimetype === 'application/pdf') {
    setImmediate(async () => {
      try {
        const patientContext = await buildPatientContext(userId);
        const { rawText, analysis } = await aiService.analyzePDF(req.file.path, patientContext);

        await doc.update({ raw_text: rawText, is_ai_analyzed: true });

        await AIAnalysis.create({
          patient_id: userId,
          document_id: doc.id,
          analysis_type: 'document',
          input_data: { filename: req.file.originalname, category },
          result: analysis,
          confidence_score: analysis.confidenceScore || null,
          summary: analysis.summary || null,
          recommended_specialty: analysis.recommendedSpecialty || null,
          urgency_level: sanitizeUrgency(analysis.urgencyLevel),
        });

        console.log(`✅ AI analysis complete for doc ${doc.id}`);
      } catch (err) {
        console.error('Async AI analysis error:', err.message);
      }
    });
  }

  res.status(201).json({
    success: true,
    message: 'Document uploaded. AI analysis in progress for PDF files.',
    data: doc,
  });
}

async function getDocuments(req, res) {
  const userId = req.params.patientId || req.userId;
  const { startDate, endDate, category, page = 1, limit = 20 } = req.query;

  const where = { patient_id: userId, is_visible_to_patient: true };
  if (category) where.category = category;
  if (startDate || endDate) {
    where.document_date = {};
    if (startDate) where.document_date[Op.gte] = startDate;
    if (endDate) where.document_date[Op.lte] = endDate;
  }

  const { count, rows: docs } = await Document.findAndCountAll({
    where,
    include: [{ model: AIAnalysis, as: 'analyses', required: false, limit: 1, order: [['created_at', 'DESC']] }],
    order: [['document_date', 'DESC'], ['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });

  res.json({
    success: true,
    data: {
      docs,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / limit) },
    },
  });
}

async function getDocumentById(req, res) {
  const { id } = req.params;
  const userId = req.userId;

  const doc = await Document.findOne({
    where: { id, patient_id: userId },
    include: [{ model: AIAnalysis, as: 'analyses', order: [['created_at', 'DESC']] }],
  });

  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
  res.json({ success: true, data: doc });
}

async function getDocumentAnalysis(req, res) {
  const { id } = req.params;
  const doc = await Document.findByPk(id);
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

  const analysis = await AIAnalysis.findOne({
    where: { document_id: id },
    order: [['created_at', 'DESC']],
  });

  if (!analysis) {
    return res.json({ success: true, data: null, message: 'Analysis not yet available' });
  }
  res.json({ success: true, data: analysis });
}

async function deleteDocument(req, res) {
  const { id } = req.params;
  const userId = req.userId;

  const doc = await Document.findOne({ where: { id, patient_id: userId } });
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

  // Delete physical file
  const fullPath = path.join(process.env.UPLOAD_PATH || './uploads', 'documents', doc.filename);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

  await AIAnalysis.destroy({ where: { document_id: id } });
  await doc.destroy();

  res.json({ success: true, message: 'Document deleted' });
}

async function staffUploadDocument(req, res) {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  const { patientId, category, documentDate, title, description } = req.body;
  if (!patientId) return res.status(400).json({ success: false, message: 'Patient ID required' });

  const doc = await Document.create({
    patient_id: patientId,
    uploaded_by_type: 'staff',
    uploaded_by_id: req.userId,
    original_name: req.file.originalname,
    filename: req.file.filename,
    file_path: `/uploads/documents/${req.file.filename}`,
    file_size: req.file.size,
    mime_type: req.file.mimetype,
    category: category || 'lab_report',
    document_date: documentDate || new Date().toISOString().split('T')[0],
    title: title || req.file.originalname,
    description,
    is_ai_analyzed: false,
    is_visible_to_patient: true,
  });

  if (req.file.mimetype === 'application/pdf') {
    setImmediate(async () => {
      try {
        const patientContext = await buildPatientContext(patientId);
        const { rawText, analysis } = await aiService.analyzePDF(req.file.path, patientContext);
        await doc.update({ raw_text: rawText, is_ai_analyzed: true });
        await AIAnalysis.create({
          patient_id: patientId,
          document_id: doc.id,
          analysis_type: 'document',
          input_data: { filename: req.file.originalname, uploadedBy: 'staff' },
          result: analysis,
          confidence_score: analysis.confidenceScore || null,
          summary: analysis.summary || null,
          recommended_specialty: analysis.recommendedSpecialty || null,
          urgency_level: sanitizeUrgency(analysis.urgencyLevel),
        });
      } catch (err) {
        console.error('Staff upload AI error:', err.message);
      }
    });
  }

  res.status(201).json({ success: true, message: 'Document uploaded successfully', data: doc });
}

module.exports = {
  uploadDocument, getDocuments, getDocumentById, getDocumentAnalysis,
  deleteDocument, staffUploadDocument, buildPatientContext,
};
