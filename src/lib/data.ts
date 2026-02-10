// Emal Kamawal - Portfolio Data Constants
// This file contains all the personal and professional information for the portfolio

export const personalInfo = {
    name: 'Emal Kamawal',
    title: 'AI Researcher in Healthcare',
    tagline: 'Computer Vision • Machine Learning • Brain-Computer Interfaces',
    email: 'B22F1813CS118@fecid.paf-iast.edu.pk',
    location: 'Haripur, KPK, Pakistan',
    linkedin: 'https://linkedin.com/in/emalkamawal',
    github: 'https://github.com/emalkamawal',
    scholar: 'https://scholar.google.com/citations?user=emalkamawal',
};

export const careerObjective = `Passionate computer scientist focused on AI for healthcare and social impact. Research spans brain-computer interfaces (EEG), medical imaging, and computer vision. Seeking a master's position and grant-funded opportunities to advance AI-driven diagnostic systems with emphasis on explainable, privacy-preserving, and clinically translational machine learning.`;

export const researchAreas = [
    'AI in Health Science',
    'Medical Imaging',
    'EEG/BCI',
    'Computer Vision',
    'Deep Learning',
    'Generative AI',
    'Machine Learning for Clinical Data',
    'Federated Learning',
    'Explainable AI',
    'IoT Systems',
];

export const education = [
    {
        degree: 'Bachelor of Science in Computer Science',
        institution: 'Pak-Austria Fachhochschule: Institute of Applied Sciences & Technology',
        location: 'Haripur, KPK, Pakistan',
        period: 'Expected May 2026',
        honors: ['Allama Iqbal Scholarship Recipient (HEC Pakistan)'],
        thesis: 'Thought Viz — A Hybrid EEG-Driven Visual Reconstruction Framework',
        coursework: [
            'Advanced Algorithms',
            'Machine Learning',
            'Computer Vision',
            'Signal Processing',
            'Database Systems',
            'Software Engineering',
            'Artificial Intelligence',
            'Big Data and Analytics',
        ],
    },
    {
        degree: 'Higher Secondary Education',
        institution: 'Iqra High School',
        location: 'Afghanistan',
        period: '2017-2020',
        honors: ['Mathematics Olympiad Participant', 'Science Stream with Distinction'],
    },
];

export const publications = [
    {
        title: 'Expert Fusion Network for Automated Blastocyst Morphology and IVF Decision Support',
        authors: 'Ali Zia, Shahnawaz Qureshi, Fatima Ansarizadeh, Muhammad Fouzan, Emal Kamawal, Sajid Anwer, Chandan Karmakar',
        venue: 'IEEE Transactions on Biomedical Engineering',
        year: 2025,
        status: 'under_review',
        contribution: 'Co-developed novel multi-architecture deep learning framework combining U-Net, attention mechanisms, and mixture-of-experts achieving 98% accuracy in embryo morphology grading. Implemented data preprocessing pipeline and conducted extensive validation studies.',
    },
    {
        title: 'UAV-Based Early Weed Detection in Wheat Fields: A Comparative Study of Deep Learning Approaches',
        authors: 'Shahnawaz Qureshi, Ali Zia, Emal Kamawal, Asif Ameer, Ahsan Latif',
        venue: 'Precision Agriculture Journal',
        year: 2025,
        status: 'under_review',
        contribution: 'Conducted a comprehensive comparative analysis of CNN, SAM, ViT, and Mask R-CNN architectures for precision agriculture applications. Led dataset curation and model optimization, resulting in a 15% improvement over baseline methods.',
    },
    {
        title: 'Integrating Artificial Intelligence and Machine Learning in 3D Cell Culture Analysis and Prediction',
        authors: 'Muhammad Fozan, Muhammad Rizwan, Emal Kamawal, Muhammad Ahmad Khan, Dr. Shahnawaz Qureshi, Dr. Fazal Wahab',
        venue: 'Book Chapter',
        year: 2026,
        status: 'published',
        contribution: 'Co-authored a chapter on applying AI/ML to 3D cell culture workflows, covering imaging-based segmentation, predictive modeling, biomarker discovery, and drug screening.',
    },
    {
        title: 'Advanced Imaging and Analysis Techniques for 3D Cell Cultures and Organoids',
        authors: 'Emal Kamawal, Hazrat Nabi, Muhammad Fozan, Arbab Waheed Ahmad, Habab Ali Ahmad',
        venue: 'Advances in Drug Development: From Biosignaling to Precision Medicine, CRC Press',
        year: 2026,
        status: 'published',
        contribution: 'Co-authored Chapter 4 focusing on advanced imaging and computational analysis for 3D cell cultures and organoids.',
    },
];

export const experience = [
    {
        title: 'Junior Artificial Intelligence Intern (Computer Vision / Healthcare AI)',
        company: 'Forth Labs',
        location: 'Islamabad',
        period: 'June 20, 2025 - August 31, 2025',
        highlights: [
            'Developed an AI-driven dental X-ray image analysis system for automated missing-teeth detection',
            'Implemented YOLO-based segmentation with high-resolution, multi-scale inference',
            'Designed intelligent post-processing to refine segmentation outputs and reduce false positives',
            'Annotated and managed the dataset using the Roboflow platform',
        ],
        technologies: ['Python', 'YOLO', 'Computer Vision', 'Roboflow'],
    },
    {
        title: 'AI Research Intern',
        company: 'The Insaafdaar Law',
        location: 'Remote',
        period: 'Jan 2023 - Apr 2023',
        highlights: [
            'Architected and deployed ML-powered document processing system on AWS, reducing processing time by 40%',
            'Developed Python-based OCR application achieving 92% text extraction accuracy',
            'Built conversational AI system using Rasa NLP framework, automating 70% of client inquiries',
        ],
        technologies: ['Python', 'TensorFlow', 'AWS SageMaker', 'Rasa', 'Computer Vision APIs'],
    },
    {
        title: 'IoT Engineering Intern',
        company: 'SPCAI PAF-IAST',
        location: 'Haripur',
        period: 'Jan 2022 - Aug 2022',
        highlights: [
            'Engineered IoT-enabled smart waste management system reducing manual monitoring by 60%',
            'Integrated sensor networks with AWS IoT Core for real-time monitoring',
            'Prototyped Raspberry Pi-based environmental monitoring solutions',
        ],
        technologies: ['Raspberry Pi', 'AWS IoT Core', 'Python', 'Edge Computing'],
    },
];

export const projects = [
    {
        title: 'Thought Viz: EEG-Driven Visual Reconstruction Framework',
        role: 'Principal Investigator',
        period: '2025-Present',
        description: 'Developing novel BCI pipeline for reconstructing visual scenes from EEG signals using adaptive encoder-decoder architecture coupled with diffusion models',
        achievements: [
            'Achieved 78% accuracy in visual stimulus classification from raw EEG data',
            'Implementing real-time processing capabilities with latency under 200ms',
        ],
        category: ['BCI', 'Deep Learning', 'Signal Processing'],
    },
    {
        title: 'Advanced Medical Imaging Research Initiative',
        role: 'Research Assistant',
        period: '2023-2024',
        description: 'Developed U-Net based brain tumor segmentation system and ensemble learning approach for heart disease prediction',
        achievements: [
            '98.2% dice coefficient on BRATS dataset for brain tumor segmentation',
            '99.35% accuracy in heart disease prediction using clinical biomarkers',
        ],
        category: ['Medical Imaging', 'Deep Learning', 'Healthcare AI'],
    },
    {
        title: 'Real-Time DDoS Attack Detection System',
        category: ['Cybersecurity', 'Machine Learning'],
        description: 'Developed supervised learning pipeline for network intrusion detection achieving 96.8% accuracy with sub-millisecond response time.',
    },
    {
        title: 'YOLO-Powered Blackjack Strategy Assistant',
        category: ['Computer Vision', 'Gaming AI'],
        description: 'Created real-time card detection and optimal strategy recommendation system using YOLOv8.',
    },
    {
        title: 'PDF Malware Analysis Framework',
        category: ['Cybersecurity', 'NLP'],
        description: 'Built comprehensive NLP pipeline for detecting malicious JavaScript, embedded links, and phishing content in PDF documents.',
    },
    {
        title: 'Federated Learning Healthcare System',
        category: ['Privacy-Preserving ML', 'Healthcare'],
        description: 'Implemented federated learning framework for collaborative medical AI model training while preserving patient data privacy.',
    },
];

export const skills = {
    'Machine Learning & AI': [
        'Deep Neural Networks',
        'CNNs',
        'RNNs',
        'Transformers',
        'GANs',
        'Reinforcement Learning',
        'Federated Learning',
        'AutoML',
    ],
    'Computer Vision': [
        'YOLO v5-v9',
        'R-CNN variants',
        'U-Net',
        'DeepLabV3+',
        'SAM',
        'ResNet',
        'EfficientNet',
        'Vision Transformers',
    ],
    'NLP': ['BERT', 'GPT-3.5/4', 'LLaMA', 'RoBERTa', 'T5', 'Sentence Transformers'],
    'Programming': ['Python (Expert)', 'C++', 'SQL', 'R', 'MATLAB', 'JavaScript'],
    'Frameworks': ['PyTorch', 'TensorFlow/Keras', 'Scikit-learn', 'OpenCV', 'FastAPI', 'Flask', 'Streamlit'],
    'Cloud & DevOps': ['AWS (EC2, SageMaker, Lambda)', 'GCP', 'Docker', 'Kubernetes', 'MLflow', 'CI/CD'],
};

export const certifications = [
    { name: 'Machine Learning Specialization', issuer: 'Stanford University (Andrew Ng)', platform: 'Coursera' },
    { name: 'Deep Learning Specialization', issuer: 'DeepLearning.AI', platform: 'Coursera' },
    { name: 'Natural Language Processing Specialization', issuer: 'DeepLearning.AI', platform: 'Coursera' },
    { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', year: 2023 },
    { name: 'Computer Vision Specialization', issuer: 'University of Washington', platform: 'Coursera' },
    { name: 'Advanced Python for Data Science', issuer: 'IBM', platform: 'edX' },
    { name: 'IoT Systems Engineering', issuer: 'SPCAI' },
];

export const languages = [
    { language: 'English', level: 'Fluent' },
    { language: 'Pashto', level: 'Native' },
    { language: 'Persian/Dari', level: 'Fluent' },
    { language: 'Urdu', level: 'Fluent' },
];

export const references = [
    {
        name: 'Dr. Shahnawaz Qureshi',
        title: 'Associate Professor of Computer Science',
        institution: 'Pak-Austria Fachhochschule Institute of Applied Sciences & Technology',
        email: 'shahnawaz.qureshi@paf-iast.edu.pk',
        role: 'Research Supervisor - Machine Learning & Computer Vision',
    },
    {
        name: 'Dr. Arshad Iqbal',
        title: 'Associate Professor & AI Research Laboratory Director',
        institution: 'Pak-Austria Fachhochschule Institute of Applied Sciences & Technology',
        email: 'arshad.iqbal@spcai.paf-iast.edu.pk',
        role: 'Research Mentor - IoT Systems & Edge Computing',
    },
    {
        name: 'Dr. Muhammad Imran Khan',
        title: 'Assistant Professor of Biomedical Engineering',
        institution: 'Pak-Austria Fachhochschule Institute of Applied Sciences & Technology',
        email: 'imran.khan@fbse.paf-iast.edu.pk',
        role: 'Collaborator - Biomedical AI Applications',
    },
];

export const futureGoals = [
    'Advancing brain-computer interface technology for assistive applications and neural rehabilitation',
    'Developing explainable AI systems for critical healthcare decision-making',
    'Exploring federated learning approaches for privacy-preserving medical AI',
    'Investigating multimodal AI systems combining vision, language, and physiological signals',
];
