import os
import logging
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from ..models.database_models import Patient, MRIScan, Prediction, ExplainabilityResult

logger = logging.getLogger(__name__)

def generate_pdf_report(
    prediction_id: int, 
    patient: Patient, 
    scan: MRIScan, 
    prediction: Prediction, 
    explainability: ExplainabilityResult
) -> str:
    """
    Generate a high-fidelity, printable PDF diagnostic report.
    1. Setup document layout with letter/A4 grids.
    2. Write headers, clinical details, and probabilities table.
    3. Embed original scan + Grad-CAM overlay image side-by-side.
    4. Write doctor clinical comments and disclaimers.
    5. Save in uploads/reports/
    """
    reports_dir = os.path.join("uploads", "reports")
    os.makedirs(reports_dir, exist_ok=True)
    
    filename = f"report_pr_{prediction_id}.pdf"
    pdf_path = os.path.join(reports_dir, filename)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a'), # Deep Navy
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=11,
        textColor=colors.HexColor('#64748b'), # Slate Gray
        spaceAfter=15
    )

    header_section_style = ParagraphStyle(
        'SectionH',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=14,
        textColor=colors.HexColor('#1e3a8a'), # Blue
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155')
    )

    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=12,
        textColor=colors.HexColor('#b45309') # Amber
    )

    story = []

    # 1. Report Header
    story.append(Paragraph("NEUROSCAN AI - DIAGNOSTIC REPORT", title_style))
    story.append(Paragraph("Explainable Deep Learning-Based Brain Tumor Detection &amp; Support System", subtitle_style))
    story.append(Spacer(1, 10))

    # 2. Demographic & Scan Info Grid Table
    info_data = [
        [
            Paragraph("<b>Patient Name:</b>", body_style), Paragraph(patient.name, body_style),
            Paragraph("<b>Scan Reference:</b>", body_style), Paragraph(f"SC-{scan.id}", body_style)
        ],
        [
            Paragraph("<b>Patient ID:</b>", body_style), Paragraph(patient.patient_id, body_style),
            Paragraph("<b>Modality:</b>", body_style), Paragraph(scan.file_type, body_style)
        ],
        [
            Paragraph("<b>Age / Gender:</b>", body_style), Paragraph(f"{patient.age} Yrs / {patient.gender}", body_style),
            Paragraph("<b>AI Classifier:</b>", body_style), Paragraph(f"{prediction.predicted_class} ({(prediction.confidence*100):.1f}%)", body_style)
        ],
        [
            Paragraph("<b>Analysis Date:</b>", body_style), Paragraph(prediction.created_at.strftime("%Y-%m-%d %H:%M"), body_style),
            Paragraph("<b>Model Version:</b>", body_style), Paragraph(f"{prediction.model.name if prediction.model else 'DenseNet121'} (v1.2)", body_style)
        ]
    ]

    t_info = Table(info_data, colWidths=[90, 160, 90, 160])
    t_info.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#f1f5f9')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_info)
    story.append(Spacer(1, 15))

    # 3. AI Probability Spread Section
    story.append(Paragraph("AI Classification Probability Distributions", header_section_style))
    
    # We can fetch class probabilities from prediction
    probs = {p.class_name: p.probability for p in prediction.probabilities}
    if not probs:
        probs = {"Glioma": 0.0, "Meningioma": 0.0, "Pituitary Tumor": 0.0, "No Tumor": 0.0}

    prob_data = [
        [Paragraph("<b>Diagnostic Class</b>", body_style), Paragraph("<b>Probability Weight</b>", body_style)]
    ]
    for c_name, val in probs.items():
        prob_data.append([
            Paragraph(c_name, body_style),
            Paragraph(f"{(val*100):.1f}%", body_style)
        ])

    t_probs = Table(prob_data, colWidths=[200, 300])
    t_probs.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#eff6ff')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_probs)
    story.append(Spacer(1, 15))

    # 4. Explainable AI Overlays Embedding (Visuals side-by-side)
    # Check if the images exist on filesystem
    # Note: explainability.gradcam_path contains relative URL /api/files/gradcam/xxx.jpg
    # We need to map it back to the local uploads directory path uploads/gradcam/xxx.jpg
    img_story = []
    
    if explainability:
        # Original Image File
        orig_filename = os.path.basename(scan.file_path)
        orig_path = os.path.join("uploads", "mri", orig_filename)
        
        # Heatmap / Overlay Image File
        cam_filename = os.path.basename(explainability.gradcam_path) if explainability.gradcam_path else ""
        cam_path = os.path.join("uploads", "gradcam", cam_filename) if cam_filename else ""

        has_orig = os.path.exists(orig_path)
        has_cam = os.path.exists(cam_path)

        if has_orig and has_cam:
            try:
                # Resize images to fit ReportLab template (e.g. 2.2 inches width, 2.2 inches height)
                rl_orig = RLImage(orig_path, width=2.2*inch, height=2.2*inch)
                rl_cam = RLImage(cam_path, width=2.2*inch, height=2.2*inch)
                
                img_table_data = [
                    [rl_orig, rl_cam],
                    [Paragraph("<b>Original MRI Slice</b>", body_style), Paragraph("<b>Grad-CAM Heatmap Overlay</b>", body_style)]
                ]
                
                t_imgs = Table(img_table_data, colWidths=[250, 250])
                t_imgs.setStyle(TableStyle([
                    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                    ('PADDING', (0,0), (-1,-1), 4),
                ]))
                img_story.append(Paragraph("Ingested MRI and Explainable Grad-CAM Overlays", header_section_style))
                img_story.append(t_imgs)
                img_story.append(Spacer(1, 15))
            except Exception as e:
                logger.error(f"Failed to embed images in PDF: {str(e)}")
                
    if img_story:
        story.extend(img_story)

    # 5. Clinical Findings / Impression Comments
    findings_story = []
    findings_story.append(Paragraph("Clinical Findings &amp; AI Explanations", header_section_style))
    findings_story.append(Paragraph(prediction.notes or "No clinical notes provided.", body_style))
    findings_story.append(Spacer(1, 15))
    story.append(KeepTogether(findings_story))

    # 6. Safety Disclaimer Box
    disclaimer_text = (
        "<b>CLINICAL DISCLAIMER NOTICE:</b> This system provides AI-assisted analysis for research and "
        "decision-support purposes. AI predictions should not be interpreted as a standalone medical diagnosis "
        "and should be reviewed and authorized by a qualified healthcare professional/licensed neuro-radiologist."
    )
    
    disclaimer_table = Table([[Paragraph(disclaimer_text, disclaimer_style)]], colWidths=[500])
    disclaimer_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#fef3c7')), # Light Amber
        ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor('#f59e0b')),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    
    story.append(KeepTogether([
        disclaimer_table,
        Spacer(1, 25)
    ]))

    # 7. Doctor Authorization & Signatures
    signature_data = [
        [
            Paragraph("<b>Analyzing Radiologist Signature:</b><br/><br/>___________________________", body_style),
            Paragraph("<b>Authorized Chief Medical Signature:</b><br/><br/>___________________________", body_style)
        ]
    ]
    t_sig = Table(signature_data, colWidths=[250, 250])
    t_sig.setStyle(TableStyle([
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    
    story.append(KeepTogether([
        t_sig
    ]))

    # Build PDF
    doc.build(story)
    
    logger.info(f"PDF report successfully saved at: {pdf_path}")
    return f"/api/files/reports/{filename}"
