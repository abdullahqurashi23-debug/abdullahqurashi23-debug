// Seed script — populates Neon database with Emal Kamawal's CV data
// Run: node scripts/seed-cv-data.mjs

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ZnyN9UgA5bat@ep-withered-grass-a1nvd4mg-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

// ═══════════════════════════════════════════════════════
//  PROJECTS
// ═══════════════════════════════════════════════════════
const projects = [
    {
        title: 'Thought Viz: EEG-Driven Visual Reconstruction',
        slug: 'thought-viz-eeg',
        short_description: 'A hybrid EEG-driven visual reconstruction framework using adaptive encoder-decoder architecture coupled with diffusion models for brain-computer interfaces.',
        full_description: `Developing a novel BCI pipeline for reconstructing visual scenes from EEG signals using adaptive encoder-decoder architecture coupled with diffusion models.\n\nThis is a senior thesis project at the Brain-Computer Interface Laboratory, exploring the intersection of neuroscience and deep learning to enable direct visual reconstruction from brain activity.\n\n## Key Achievements\n- Achieved 78% accuracy in visual stimulus classification from raw EEG data\n- Custom preprocessing and feature extraction methods\n- Real-time processing capabilities with latency under 200ms`,
        problem_statement: 'Current brain-computer interfaces have limited capability in translating neural signals into meaningful visual outputs. Existing approaches suffer from low accuracy and high latency, making real-time applications impractical.',
        approach: 'Developed a hybrid pipeline combining adaptive encoder-decoder architecture with diffusion models. Custom preprocessing extracts spatial-temporal features from raw EEG, which are then mapped to a latent visual space. The diffusion model generates high-quality visual reconstructions from this latent representation.',
        results: 'Achieved 78% accuracy in visual stimulus classification from raw EEG data using custom preprocessing and feature extraction methods. Implemented real-time processing capabilities with latency under 200ms for practical BCI applications.',
        limitations: 'Limited to controlled laboratory settings with specific visual stimuli. Generalization to free-viewing scenarios and cross-subject transfer learning remain open challenges.',
        category: ['EEG/BCI', 'Deep Learning', 'Computer Vision'],
        tags: ['EEG', 'Brain-Computer Interface', 'Diffusion Models', 'Neural Decoding', 'Visual Reconstruction', 'PyTorch'],
        visibility: 'gated',
        is_featured: true,
        metrics: JSON.stringify([
            { label: 'Classification Accuracy', value: '78%' },
            { label: 'Latency', value: '<200ms' },
            { label: 'EEG Channels', value: '64' },
            { label: 'Status', value: 'Active' }
        ]),
        gated_code: `import torch\nimport torch.nn as nn\nfrom models.encoder import EEGEncoder\nfrom models.decoder import DiffusionDecoder\n\nclass ThoughtVizPipeline(nn.Module):\n    def __init__(self, eeg_channels=64, latent_dim=512):\n        super().__init__()\n        self.encoder = EEGEncoder(channels=eeg_channels, latent_dim=latent_dim)\n        self.decoder = DiffusionDecoder(latent_dim=latent_dim)\n\n    def forward(self, eeg_signal):\n        latent = self.encoder(eeg_signal)\n        reconstruction = self.decoder(latent)\n        return reconstruction`,
    },
    {
        title: 'Brain Tumor Segmentation with U-Net',
        slug: 'brain-tumor-segmentation',
        short_description: 'U-Net based brain tumor segmentation system achieving 98.2% dice coefficient on BRATS dataset for clinical diagnostics.',
        full_description: `Developed a U-Net based brain tumor segmentation system as part of the Advanced Medical Imaging Research Initiative at the Medical AI Laboratory.\n\n## Overview\nThis project applies deep learning to the critical clinical task of brain tumor segmentation from MRI scans, enabling precise delineation of tumor boundaries to assist neurosurgeons in treatment planning.\n\n## Technical Details\n- Modified U-Net architecture optimized for 3D medical volumes\n- Trained and validated on the BRATS challenge dataset\n- Multi-class segmentation (enhancing tumor, core, whole tumor)\n- Extensive collaboration with medical professionals for clinical validation`,
        problem_statement: 'Manual brain tumor segmentation from MRI scans is time-consuming, subjective, and prone to inter-observer variability. Automated segmentation can assist radiologists in faster and more consistent diagnosis.',
        approach: 'Implemented enhanced U-Net architecture with attention gates and deep supervision for multi-class brain tumor segmentation. Applied extensive data augmentation and post-processing for refined boundary detection.',
        results: 'Achieved 98.2% dice coefficient on the BRATS dataset. The system was validated by medical professionals for potential clinical deployment.',
        category: ['Medical Imaging', 'Deep Learning', 'Healthcare AI'],
        tags: ['U-Net', 'Brain Tumor', 'MRI', 'Segmentation', 'BRATS', 'PyTorch', 'Medical AI'],
        visibility: 'public',
        is_featured: true,
        metrics: JSON.stringify([
            { label: 'Dice Coefficient', value: '98.2%' },
            { label: 'Dataset', value: 'BRATS' },
            { label: 'Architecture', value: 'U-Net' },
            { label: 'Modality', value: 'MRI' }
        ]),
    },
    {
        title: 'Heart Disease Prediction System',
        slug: 'heart-disease-prediction',
        short_description: 'Ensemble learning approach for heart disease prediction reaching 99.35% accuracy using clinical biomarkers.',
        full_description: `Implemented an ensemble learning approach for predicting heart disease from clinical biomarker data, achieving state-of-the-art accuracy.\n\n## Technical Approach\n- Ensemble of gradient boosting, random forest, and neural network classifiers\n- Feature engineering from clinical biomarkers including cholesterol, blood pressure, ECG features\n- Cross-validation and rigorous statistical evaluation\n- Collaborated with medical professionals to validate diagnostic predictions`,
        problem_statement: 'Early detection of heart disease from clinical biomarkers can significantly improve patient outcomes. Traditional diagnostic methods may miss subtle patterns in complex biomarker data.',
        approach: 'Built an ensemble learning pipeline combining XGBoost, Random Forest, and deep neural networks with clinical feature engineering. Applied SMOTE for class balancing and used SHAP for model explainability.',
        results: 'Achieved 99.35% accuracy in heart disease prediction using clinical biomarkers. Validated by medical professionals for clinical relevance.',
        category: ['Healthcare AI', 'Machine Learning'],
        tags: ['Ensemble Learning', 'Heart Disease', 'Clinical Biomarkers', 'XGBoost', 'SHAP', 'Scikit-learn'],
        visibility: 'public',
        is_featured: false,
        metrics: JSON.stringify([
            { label: 'Accuracy', value: '99.35%' },
            { label: 'Method', value: 'Ensemble' },
            { label: 'Features', value: 'Clinical' }
        ]),
    },
    {
        title: 'Dental X-Ray AI Analysis',
        slug: 'dental-xray-ai',
        short_description: 'AI-driven dental X-ray analysis system for automated missing-teeth detection using YOLO segmentation with high-resolution multi-scale inference.',
        full_description: `Developed during internship at Forth Labs, Islamabad. An AI-driven dental X-ray image analysis system for automated missing-teeth detection, delivering consistent, data-driven clinical insights.\n\n## Key Features\n- YOLO-based segmentation with high-resolution, multi-scale inference\n- Intelligent post-processing to refine segmentation outputs and reduce false positives\n- Visual overlay validation for repeatable, production-ready results\n- Dataset annotated and managed using the Roboflow platform`,
        problem_statement: 'Dental X-ray analysis for missing teeth detection is manual, time-consuming, and subject to human error. Automated detection can assist dentists in faster and more accurate diagnosis.',
        approach: 'Implemented YOLO-based segmentation with multi-scale inference for detecting small and subtle missing-tooth regions. Designed intelligent post-processing to refine outputs, reduce false positives, and enhance clinical reliability.',
        results: 'Successfully deployed automated missing-teeth detection with high clinical reliability. Validated predictions using visual overlays and iterative testing.',
        category: ['Computer Vision', 'Healthcare AI', 'Medical Imaging'],
        tags: ['YOLO', 'Dental X-ray', 'Segmentation', 'Roboflow', 'Computer Vision', 'Medical AI'],
        visibility: 'gated',
        is_featured: true,
        metrics: JSON.stringify([
            { label: 'Architecture', value: 'YOLO' },
            { label: 'Application', value: 'Dental' },
            { label: 'Platform', value: 'Roboflow' }
        ]),
        gated_code: `import torch\nfrom ultralytics import YOLO\nimport cv2\nimport numpy as np\n\ndef detect_missing_teeth(image_path, model_path='best.pt'):\n    model = YOLO(model_path)\n    results = model.predict(\n        source=image_path,\n        imgsz=1024,\n        conf=0.25,\n        iou=0.45,\n        augment=True\n    )\n    return results`,
    },
    {
        title: 'Real-Time DDoS Attack Detection',
        slug: 'ddos-detection',
        short_description: 'Supervised learning pipeline for network intrusion detection achieving 96.8% accuracy with sub-millisecond response time.',
        full_description: `Developed a supervised learning pipeline for real-time DDoS attack detection in network traffic.\n\n## Overview\n- Feature engineering techniques for high-dimensional network traffic analysis\n- Sub-millisecond response time for production-ready deployment\n- Multi-class classification of attack types including SYN flood, UDP flood, and HTTP flood`,
        problem_statement: 'Distributed Denial of Service attacks continue to threaten network infrastructure. Real-time detection with low latency is critical for effective mitigation.',
        approach: 'Developed a supervised ML pipeline with custom feature engineering for high-dimensional network traffic. Optimized for sub-millisecond inference using model distillation and efficient feature extraction.',
        results: 'Achieved 96.8% accuracy in DDoS attack detection with sub-millisecond response time, making it suitable for real-time deployment.',
        category: ['Cybersecurity', 'Machine Learning'],
        tags: ['DDoS', 'Network Security', 'Anomaly Detection', 'Real-time', 'Feature Engineering'],
        visibility: 'public',
        is_featured: false,
        metrics: JSON.stringify([
            { label: 'Accuracy', value: '96.8%' },
            { label: 'Response', value: '<1ms' },
            { label: 'Type', value: 'Multi-class' }
        ]),
    },
    {
        title: 'YOLO-Powered Blackjack Strategy Assistant',
        slug: 'blackjack-cv',
        short_description: 'Real-time card detection and optimal strategy recommendation system using YOLOv8 with live video feed processing.',
        full_description: `Created a real-time card detection and optimal strategy recommendation system using YOLOv8.\n\n## Features\n- Real-time card detection from live video feed\n- Probability calculations for optimal play strategy\n- Integrated live video processing pipeline\n- Custom-trained YOLOv8 model on playing card dataset`,
        approach: 'Trained YOLOv8 on a custom playing card dataset and integrated probability calculations with live video feed processing for real-time strategy recommendations.',
        results: 'Successfully detects cards in real-time from live video feed and provides optimal strategy recommendations based on probability calculations.',
        category: ['Computer Vision', 'Deep Learning'],
        tags: ['YOLOv8', 'Object Detection', 'Real-time', 'Computer Vision', 'Gaming AI'],
        visibility: 'public',
        is_featured: false,
        metrics: JSON.stringify([
            { label: 'Model', value: 'YOLOv8' },
            { label: 'Processing', value: 'Real-time' },
            { label: 'Input', value: 'Live Video' }
        ]),
    },
    {
        title: 'PDF Malware Analysis Framework',
        slug: 'pdf-malware-detection',
        short_description: 'Comprehensive NLP pipeline for detecting malicious JavaScript, embedded links, and phishing content in PDF documents.',
        full_description: `Built a comprehensive NLP pipeline for analyzing PDF documents for potential malware and phishing threats.\n\n## Detection Capabilities\n- Malicious JavaScript detection\n- Embedded link analysis\n- Phishing content identification\n- Deep learning and pattern recognition techniques`,
        approach: 'Developed a multi-stage NLP pipeline combining deep learning for content analysis with pattern recognition for structural anomaly detection in PDF documents.',
        results: 'Successfully detects malicious JavaScript, embedded links, and phishing content in PDF documents using deep learning and pattern recognition techniques.',
        category: ['Cybersecurity', 'NLP'],
        tags: ['NLP', 'Malware Detection', 'PDF Analysis', 'Deep Learning', 'Phishing', 'Security'],
        visibility: 'public',
        is_featured: false,
        metrics: JSON.stringify([
            { label: 'Threats', value: '3 Types' },
            { label: 'Method', value: 'NLP + DL' },
            { label: 'Format', value: 'PDF' }
        ]),
    },
    {
        title: 'Federated Learning Healthcare System',
        slug: 'federated-healthcare',
        short_description: 'Privacy-preserving federated learning framework for collaborative medical AI model training across multiple healthcare institutions.',
        full_description: `Implemented a federated learning framework for collaborative medical AI model training while preserving patient data privacy across multiple healthcare institutions.\n\n## Key Features\n- Federated averaging with differential privacy\n- Secure aggregation protocol\n- Multi-institutional collaboration without data sharing\n- Privacy-preserving gradient updates`,
        problem_statement: 'Healthcare AI models need large, diverse datasets for training, but patient data privacy regulations prevent data sharing between institutions. Federated learning enables collaborative training without sharing raw data.',
        approach: 'Implemented federated averaging with differential privacy guarantees. Designed secure aggregation protocols to enable multi-institutional model training without exposing raw patient data.',
        results: 'Successfully demonstrated privacy-preserving collaborative training across simulated healthcare institutions while maintaining model performance comparable to centralized training.',
        category: ['Privacy', 'Healthcare AI', 'Machine Learning'],
        tags: ['Federated Learning', 'Privacy', 'Healthcare', 'Differential Privacy', 'PyTorch'],
        visibility: 'gated',
        is_featured: true,
        metrics: JSON.stringify([
            { label: 'Privacy', value: 'DP-SGD' },
            { label: 'Method', value: 'FedAvg' },
            { label: 'Nodes', value: 'Multi-site' }
        ]),
        gated_code: `import torch\nimport copy\nfrom collections import OrderedDict\n\ndef federated_average(models, weights=None):\n    \"\"\"Federated Averaging (FedAvg)\"\"\"\n    if weights is None:\n        weights = [1.0 / len(models)] * len(models)\n    \n    avg_state = OrderedDict()\n    for key in models[0].state_dict():\n        avg_state[key] = sum(\n            w * m.state_dict()[key].float()\n            for w, m in zip(weights, models)\n        )\n    \n    global_model = copy.deepcopy(models[0])\n    global_model.load_state_dict(avg_state)\n    return global_model`,
    },
];

// ═══════════════════════════════════════════════════════
//  PUBLICATIONS
// ═══════════════════════════════════════════════════════
const publications = [
    {
        title: 'Expert Fusion Network for Automated Blastocyst Morphology and IVF Decision Support',
        authors: ['Ali Zia', 'Shahnawaz Qureshi', 'Fatima Ansarizadeh', 'Muhammad Fouzan', 'Emal Kamawal', 'Sajid Anwer', 'Chandan Karmakar'],
        journal: 'IEEE Transactions on Biomedical Engineering',
        year: 2025,
        status: 'under-review',
        abstract: 'Co-developed novel multi-architecture deep learning framework combining U-Net, attention mechanisms, and mixture-of-experts achieving 98% accuracy in embryo morphology grading. Implemented data preprocessing pipeline and conducted extensive validation studies for IVF decision support.',
        contributions: [
            'Co-developed novel multi-architecture deep learning framework combining U-Net, attention mechanisms, and mixture-of-experts',
            'Achieved 98% accuracy in embryo morphology grading',
            'Implemented data preprocessing pipeline',
            'Conducted extensive validation studies for IVF clinical decision support'
        ],
    },
    {
        title: 'UAV-Based Early Weed Detection in Wheat Fields: A Comparative Study of Deep Learning Approaches',
        authors: ['Shahnawaz Qureshi', 'Ali Zia', 'Emal Kamawal', 'Asif Ameer', 'Ahsan Latif'],
        journal: 'Precision Agriculture Journal',
        year: 2025,
        status: 'under-review',
        abstract: 'Conducted a comprehensive comparative analysis of CNN, SAM, ViT, and Mask R-CNN architectures for precision agriculture applications. Led dataset curation and model optimization, resulting in a 15% improvement over baseline methods for early weed detection in wheat fields using UAV imagery.',
        contributions: [
            'Conducted comprehensive comparative analysis of CNN, SAM, ViT, and Mask R-CNN architectures',
            'Led dataset curation and model optimization for precision agriculture',
            'Achieved 15% improvement over baseline methods',
            'Applied state-of-the-art vision architectures to UAV-based agricultural imaging'
        ],
    },
    {
        title: 'Integrating Artificial Intelligence and Machine Learning in 3D Cell Culture Analysis and Prediction',
        authors: ['Muhammad Fozan', 'Muhammad Rizwan', 'Emal Kamawal', 'Muhammad Ahmad Khan', 'Shahnawaz Qureshi', 'Fazal Wahab'],
        journal: 'Book Chapter — Advances in Biotechnology',
        year: 2026,
        status: 'book-chapter',
        abstract: 'Co-authored a chapter on applying AI/ML to 3D cell culture workflows, covering imaging-based segmentation, predictive modeling, biomarker discovery, and drug screening. Synthesized case studies in oncology and stem cell research while reviewing challenges in data quality, reproducibility, model interpretability, and regulatory considerations.',
        contributions: [
            'Co-authored chapter on AI/ML applications in 3D cell culture workflows',
            'Covered imaging-based segmentation, predictive modeling, biomarker discovery, and drug screening',
            'Synthesized case studies in oncology and stem cell research',
            'Reviewed challenges including data quality, reproducibility, and model interpretability'
        ],
    },
    {
        title: 'Advanced Imaging and Analysis Techniques for 3D Cell Cultures and Organoids',
        authors: ['Emal Kamawal', 'Hazrat Nabi', 'Muhammad Fozan', 'Arbab Waheed Ahmad', 'Habab Ali Ahmad'],
        journal: 'CRC Press — Advances in Drug Development: From Biosignaling to Precision Medicine',
        year: 2026,
        status: 'book-chapter',
        abstract: 'Co-authored Chapter 4 focusing on advanced imaging and computational analysis for 3D cell cultures and organoids. Covered end-to-end workflows including microscopy data preparation, segmentation and quantification techniques, and AI/ML-driven analysis for phenotyping, biomarker discovery, and drug-response prediction.',
        contributions: [
            'Co-authored Chapter 4 on advanced imaging for 3D cell cultures and organoids (Editor: Dr. Muhammad Imran Khan)',
            'Covered end-to-end imaging and computational analysis workflows',
            'Discussed AI/ML-driven analysis for phenotyping, biomarker discovery, and drug-response prediction',
            'Addressed practical challenges: reproducibility, data quality, and interpretability'
        ],
    },
];

// ═══════════════════════════════════════════════════════
//  CERTIFICATIONS
// ═══════════════════════════════════════════════════════
const certifications = [
    {
        title: 'Machine Learning Specialization',
        issuer: 'Stanford University via Coursera (Andrew Ng)',
        date_issued: '2024',
        credential_url: 'https://coursera.org/verify/specialization/machine-learning',
    },
    {
        title: 'Deep Learning Specialization',
        issuer: 'DeepLearning.AI via Coursera (5-course series)',
        date_issued: '2024',
        credential_url: 'https://coursera.org/verify/specialization/deep-learning',
    },
    {
        title: 'Natural Language Processing Specialization',
        issuer: 'DeepLearning.AI via Coursera',
        date_issued: '2024',
        credential_url: 'https://coursera.org/verify/specialization/nlp',
    },
    {
        title: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        date_issued: '2023',
        credential_url: 'https://aws.amazon.com/verification',
    },
    {
        title: 'Computer Vision Specialization',
        issuer: 'University of Washington via Coursera',
        date_issued: '2024',
        credential_url: 'https://coursera.org/verify/specialization/computer-vision',
    },
    {
        title: 'Advanced Python for Data Science',
        issuer: 'IBM via edX',
        date_issued: '2023',
        credential_url: 'https://courses.edx.org/certificates',
    },
    {
        title: 'IoT Systems Engineering',
        issuer: 'SPCAI Professional Certification',
        date_issued: '2022',
        credential_url: null,
    },
];

// ═══════════════════════════════════════════════════════
//  RUN SEED
// ═══════════════════════════════════════════════════════
async function seed() {
    console.log('🌱 Seeding Emal Kamawal CV data into Neon...\n');

    // --- Projects ---
    console.log('📂 Inserting Projects...');
    for (const p of projects) {
        await sql`
            INSERT INTO projects (title, slug, short_description, full_description, problem_statement, approach, results, limitations, category, tags, visibility, is_featured, metrics, gated_code)
            VALUES (${p.title}, ${p.slug}, ${p.short_description}, ${p.full_description}, ${p.problem_statement || null}, ${p.approach || null}, ${p.results || null}, ${p.limitations || null}, ${p.category}, ${p.tags}, ${p.visibility}, ${p.is_featured}, ${p.metrics}, ${p.gated_code || null})
            ON CONFLICT (slug) DO UPDATE SET
                title = EXCLUDED.title,
                short_description = EXCLUDED.short_description,
                full_description = EXCLUDED.full_description,
                problem_statement = EXCLUDED.problem_statement,
                approach = EXCLUDED.approach,
                results = EXCLUDED.results,
                limitations = EXCLUDED.limitations,
                category = EXCLUDED.category,
                tags = EXCLUDED.tags,
                visibility = EXCLUDED.visibility,
                is_featured = EXCLUDED.is_featured,
                metrics = EXCLUDED.metrics,
                gated_code = EXCLUDED.gated_code
        `;
        console.log(`   ✅ ${p.title}`);
    }

    // --- Publications ---
    console.log('\n📄 Inserting Publications...');
    for (const pub of publications) {
        // Check if publication already exists by title
        const existing = await sql`SELECT id FROM publications WHERE title = ${pub.title}`;
        if (existing.length > 0) {
            await sql`
                UPDATE publications SET
                    authors = ${pub.authors},
                    journal = ${pub.journal},
                    year = ${pub.year},
                    status = ${pub.status},
                    abstract = ${pub.abstract},
                    contributions = ${pub.contributions}
                WHERE title = ${pub.title}
            `;
        } else {
            await sql`
                INSERT INTO publications (title, authors, journal, year, status, abstract, contributions)
                VALUES (${pub.title}, ${pub.authors}, ${pub.journal}, ${pub.year}, ${pub.status}, ${pub.abstract}, ${pub.contributions})
            `;
        }
        console.log(`   ✅ ${pub.title.substring(0, 60)}...`);
    }

    // --- Certifications ---
    console.log('\n🏅 Inserting Certifications...');
    for (const cert of certifications) {
        const existing = await sql`SELECT id FROM certifications WHERE title = ${cert.title}`;
        if (existing.length === 0) {
            await sql`
                INSERT INTO certifications (title, issuer, date_issued, credential_url)
                VALUES (${cert.title}, ${cert.issuer}, ${cert.date_issued}, ${cert.credential_url})
            `;
        }
        console.log(`   ✅ ${cert.title}`);
    }

    // --- Verify Counts ---
    const pCount = await sql`SELECT COUNT(*) as c FROM projects`;
    const pubCount = await sql`SELECT COUNT(*) as c FROM publications`;
    const certCount = await sql`SELECT COUNT(*) as c FROM certifications`;

    console.log(`\n🎉 Seeding complete!`);
    console.log(`   📂 Projects:      ${pCount[0].c}`);
    console.log(`   📄 Publications:   ${pubCount[0].c}`);
    console.log(`   🏅 Certifications: ${certCount[0].c}\n`);
}

seed().catch(console.error);
