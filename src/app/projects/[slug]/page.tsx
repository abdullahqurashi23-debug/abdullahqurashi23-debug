import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft, FiExternalLink, FiLock } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import ProjectGitHubSection from '@/components/project/ProjectGitHubSection';
import { supabase } from '@/lib/supabase';


// Static project data for fallback when Supabase is not configured
interface Project {
    id: string;
    title: string;
    slug: string;
    short_description: string;
    full_description: string;
    problem_statement: string;
    approach: string;
    results: string;
    limitations: string;
    category: string[];
    tags: string[];
    github_link: string;
    visibility: 'public' | 'gated' | 'nda';
    is_featured: boolean;
    images: { url: string; caption: string }[];
    metrics: { label: string; value: string }[];
    created_at: string;
}

const staticProjects: Record<string, Project> = {
    'thought-viz': {
        id: '1',
        title: 'Thought Viz: EEG-Driven Visual Reconstruction',
        slug: 'thought-viz',
        short_description: 'Novel BCI pipeline for reconstructing visual scenes from EEG signals using adaptive encoder-decoder architecture coupled with diffusion models.',
        full_description: 'A groundbreaking brain-computer interface project that reconstructs visual scenes directly from EEG brain signals. This system uses an adaptive encoder-decoder architecture combined with state-of-the-art diffusion models to achieve unprecedented accuracy in visual reconstruction from neural data.',
        problem_statement: 'Understanding what a person is seeing or imagining from their brain activity has been a long-standing challenge in neuroscience. Traditional approaches have been limited by low-resolution outputs and poor generalization.',
        approach: '- Developed custom EEG preprocessing pipeline for artifact removal\n- Implemented adaptive temporal attention mechanism\n- Trained conditional diffusion model on EEG-image pairs\n- Used contrastive learning for better latent space alignment',
        results: '- Achieved 78% structural similarity in visual reconstruction\n- Real-time processing under 200ms latency\n- Successfully generalized to unseen image categories\n- Published open-source implementation',
        limitations: 'Current system requires high-density EEG (64+ channels). Future work aims to reduce channel requirements while maintaining accuracy.',
        category: ['EEG/BCI', 'Healthcare AI'],
        tags: ['BCI', 'Deep Learning', 'EEG', 'Diffusion Models', 'Signal Processing'],
        github_link: '',
        visibility: 'public',
        is_featured: true,
        images: [{ url: '/projects/thought-viz.png', caption: 'Thought Viz Architecture' }],
        metrics: [
            { label: 'Accuracy', value: '78%' },
            { label: 'Latency', value: '<200ms' },
            { label: 'Channels', value: '64 EEG' },
            { label: 'Dataset Size', value: '10K pairs' }
        ],
        created_at: '2025-01-01',
    },
    'brain-tumor-segmentation': {
        id: '2',
        title: 'Brain Tumor Segmentation System',
        slug: 'brain-tumor-segmentation',
        short_description: 'U-Net based brain tumor segmentation system achieving 98.2% dice coefficient on BRATS dataset.',
        full_description: 'An advanced medical imaging AI system designed for automated brain tumor detection and segmentation in MRI scans. Validated with medical professionals for potential clinical deployment.',
        problem_statement: 'Manual brain tumor segmentation is time-consuming and subject to inter-observer variability. Automated solutions are needed to assist radiologists in clinical workflows.',
        approach: '- Enhanced U-Net architecture with attention mechanisms\n- Multi-scale feature extraction\n- Deep supervision for improved gradient flow\n- Extensive data augmentation for robustness',
        results: '- 98.2% Dice coefficient on BRATS 2021 dataset\n- 40% reduction in inference time vs baseline\n- Validated by 3 neuroradiologists\n- Ready for clinical pilot study',
        limitations: 'Currently optimized for glioma segmentation. Expansion to other tumor types in progress.',
        category: ['Healthcare AI', 'Computer Vision'],
        tags: ['Medical Imaging', 'Segmentation', 'U-Net', 'Deep Learning', 'MRI'],
        github_link: '',
        visibility: 'public',
        is_featured: true,
        images: [{ url: '/projects/brain-tumor.png', caption: 'Segmentation Results' }],
        metrics: [
            { label: 'Dice Score', value: '98.2%' },
            { label: 'Sensitivity', value: '97.8%' },
            { label: 'Specificity', value: '99.1%' },
            { label: 'Inference', value: '1.2s' }
        ],
        created_at: '2024-01-15',
    },
    'ivf-expert-fusion': {
        id: '3',
        title: 'Expert Fusion Network for IVF Decision Support',
        slug: 'ivf-expert-fusion',
        short_description: 'Multi-architecture deep learning framework for automated embryo morphology grading in IVF procedures.',
        full_description: 'A novel multi-architecture deep learning framework combining U-Net, attention mechanisms, and mixture-of-experts for automated embryo morphology grading in IVF procedures.',
        problem_statement: 'Embryo selection in IVF is subjective and relies heavily on embryologist expertise. Automated grading could improve consistency and success rates.',
        approach: '- Developed mixture-of-experts architecture\n- Combined U-Net segmentation with attention-based classification\n- Multi-task learning for simultaneous grading criteria\n- Extensive validation with clinical embryologists',
        results: '- 98% accuracy in embryo morphology grading\n- Reduced grading time by 75%\n- Strong agreement with senior embryologists\n- Paper under review at IEEE TBME',
        limitations: 'Requires standardized imaging protocols. Working on adaptation for varied clinical setups.',
        category: ['Healthcare AI', 'Computer Vision'],
        tags: ['Healthcare AI', 'Deep Learning', 'IVF', 'Medical Imaging'],
        github_link: '',
        visibility: 'gated',
        is_featured: true,
        images: [{ url: '/projects/ivf-fusion.png', caption: 'Expert Fusion Architecture' }],
        metrics: [
            { label: 'Accuracy', value: '98%' },
            { label: 'Time Saved', value: '75%' },
            { label: 'Agreement', value: '96%' },
            { label: 'Experts', value: '5' }
        ],
        created_at: '2025-01-15',
    },
    'heart-disease-prediction': {
        id: '4',
        title: 'Heart Disease Prediction System',
        slug: 'heart-disease-prediction',
        short_description: 'Ensemble learning approach for heart disease prediction reaching 99.35% accuracy using clinical biomarkers.',
        full_description: 'A comprehensive heart disease prediction system using ensemble machine learning methods. Collaborated with medical professionals for validation and clinical relevance.',
        problem_statement: 'Early detection of heart disease is crucial for prevention and treatment. Traditional risk scores have limited accuracy.',
        approach: '- Ensemble of XGBoost, Random Forest, and Neural Networks\n- Feature engineering based on clinical expertise\n- SHAP-based explanations for transparency\n- Cross-validation with multiple clinical datasets',
        results: '- 99.35% prediction accuracy\n- Superior to traditional Framingham risk score\n- Interpretable predictions for clinicians\n- Deployed for pilot testing',
        limitations: 'Requires comprehensive blood panel data. Working on reduced-feature version.',
        category: ['Healthcare AI'],
        tags: ['Ensemble Learning', 'Clinical Data', 'Healthcare', 'Biomarkers'],
        github_link: '',
        visibility: 'public',
        is_featured: true,
        images: [{ url: '/projects/heart-disease.png', caption: 'Prediction Pipeline' }],
        metrics: [
            { label: 'Accuracy', value: '99.35%' },
            { label: 'AUC-ROC', value: '0.998' },
            { label: 'Features', value: '23' },
            { label: 'Patients', value: '50K+' }
        ],
        created_at: '2024-02-20',
    },
    'ddos-detection': {
        id: '5',
        title: 'Real-Time DDoS Attack Detection',
        slug: 'ddos-detection',
        short_description: 'Supervised learning pipeline for network intrusion detection achieving 96.8% accuracy.',
        full_description: 'A real-time DDoS attack detection system using supervised machine learning for network security.',
        problem_statement: 'DDoS attacks are becoming more sophisticated and frequent. Real-time detection is essential for network security.',
        approach: '- Feature engineering for network traffic patterns\n- Ensemble of gradient boosting models\n- Real-time streaming architecture\n- Adaptive thresholds for different attack types',
        results: '- 96.8% detection accuracy\n- Sub-millisecond response time\n- Low false positive rate\n- Deployed in production environment',
        limitations: 'Requires network flow data access. Working on host-based alternative.',
        category: ['Cybersecurity'],
        tags: ['DDoS', 'Network Security', 'Machine Learning', 'Anomaly Detection'],
        github_link: '',
        visibility: 'public',
        is_featured: false,
        images: [{ url: '/projects/ddos-defense.png', caption: 'Detection Pipeline' }],
        metrics: [
            { label: 'Accuracy', value: '96.8%' },
            { label: 'Latency', value: '<1ms' },
            { label: 'FPR', value: '0.3%' },
            { label: 'Attacks', value: '15 types' }
        ],
        created_at: '2023-11-05',
    },
    'dental-xray-ai': {
        id: '6',
        title: 'Dental X-Ray AI Analysis',
        slug: 'dental-xray-ai',
        short_description: 'AI-driven dental X-ray image analysis system for automated missing-teeth detection using YOLO-based segmentation.',
        full_description: 'Advanced dental X-ray analysis system using deep learning for automated detection and analysis of missing teeth and dental anomalies.',
        problem_statement: 'Dental X-ray analysis is time-consuming and requires expert interpretation. Automated systems can assist dentists in faster diagnosis.',
        approach: '- YOLO-based object detection for tooth identification\n- Multi-scale inference for high accuracy\n- Data augmentation with dental-specific transformations\n- Integration with DICOM standards',
        results: '- 95% accuracy in missing tooth detection\n- Real-time processing capability\n- Successfully integrated with clinic workflows',
        limitations: 'Currently focused on panoramic X-rays. Expanding to periapical and bitewing radiographs.',
        category: ['Healthcare AI', 'Computer Vision'],
        tags: ['Dental AI', 'X-Ray', 'YOLO', 'Object Detection', 'Healthcare'],
        github_link: '',
        visibility: 'gated',
        is_featured: false,
        images: [{ url: '/projects/dental-ai.png', caption: 'Detection Results' }],
        metrics: [
            { label: 'Accuracy', value: '95%' },
            { label: 'Processing', value: 'Real-time' },
            { label: 'Teeth Types', value: '32' },
            { label: 'Clinics', value: '5+' }
        ],
        created_at: '2025-06-20',
    },
    'blackjack-cv': {
        id: '7',
        title: 'YOLO-Powered Blackjack Strategy Assistant',
        slug: 'blackjack-cv',
        short_description: 'Real-time card detection and optimal strategy recommendation system using YOLOv8.',
        full_description: 'A computer vision system that detects playing cards in real-time and provides optimal blackjack strategy recommendations based on probabilistic calculations.',
        problem_statement: 'Learning optimal blackjack strategy is challenging. A real-time assistant can help players make better decisions.',
        approach: '- YOLOv8 for real-time card detection\n- Custom dataset of playing cards\n- Probability-based strategy engine\n- Live video processing pipeline',
        results: '- 99% card detection accuracy\n- <50ms inference time\n- Accurate strategy recommendations',
        limitations: 'Works best with standard playing cards. Custom decks may require retraining.',
        category: ['Computer Vision'],
        tags: ['YOLO', 'Real-time Detection', 'Computer Vision', 'Gaming AI'],
        github_link: 'https://github.com/emalkamawal/blackjack-cv',
        visibility: 'public',
        is_featured: false,
        images: [{ url: '/projects/blackjack.png', caption: 'Card Detection' }],
        metrics: [
            { label: 'Accuracy', value: '99%' },
            { label: 'Latency', value: '<50ms' },
            { label: 'Cards', value: '52' },
            { label: 'FPS', value: '30+' }
        ],
        created_at: '2023-09-15',
    },
    'pdf-malware-detection': {
        id: '8',
        title: 'PDF Malware Analysis Framework',
        slug: 'pdf-malware-detection',
        short_description: 'Comprehensive NLP pipeline for detecting malicious JavaScript and phishing content in PDF documents.',
        full_description: 'A security-focused system that analyzes PDF documents for malicious content including embedded JavaScript, suspicious links, and phishing indicators.',
        problem_statement: 'PDF files are common vectors for malware distribution. Automated detection helps protect organizations from threats.',
        approach: '- NLP-based content analysis\n- JavaScript deobfuscation\n- Link reputation checking\n- Machine learning classifiers',
        results: '- 97% malware detection rate\n- <5% false positive rate\n- Processes 1000+ PDFs per hour',
        limitations: 'Encrypted PDFs require password for analysis. Zero-day exploits may evade detection initially.',
        category: ['Cybersecurity', 'NLP'],
        tags: ['Malware Detection', 'NLP', 'PDF Analysis', 'Deep Learning', 'Security'],
        github_link: '',
        visibility: 'public',
        is_featured: false,
        images: [{ url: '/projects/pdf-malware.png', caption: 'Analysis Pipeline' }],
        metrics: [
            { label: 'Detection', value: '97%' },
            { label: 'FPR', value: '<5%' },
            { label: 'Throughput', value: '1K/hr' },
            { label: 'Threats', value: '50+' }
        ],
        created_at: '2023-08-10',
    },
    'federated-healthcare': {
        id: '9',
        title: 'Federated Learning Healthcare System',
        slug: 'federated-healthcare',
        short_description: 'Federated learning framework for collaborative medical AI model training while preserving patient data privacy.',
        full_description: 'A privacy-preserving federated learning framework that enables multiple healthcare institutions to collaboratively train AI models without sharing sensitive patient data.',
        problem_statement: 'Healthcare AI requires large datasets, but patient privacy regulations prevent data sharing between institutions.',
        approach: '- Federated averaging algorithm\n- Differential privacy guarantees\n- Secure aggregation protocols\n- HIPAA-compliant infrastructure',
        results: '- Achieved comparable accuracy to centralized training\n- Zero patient data exposure\n- Successfully deployed across 3 hospitals',
        limitations: 'Requires significant compute resources at each institution. Synchronization overhead for large models.',
        category: ['Healthcare AI', 'Privacy'],
        tags: ['Federated Learning', 'Privacy-Preserving ML', 'Healthcare', 'Distributed Systems'],
        github_link: '',
        visibility: 'gated',
        is_featured: true,
        images: [{ url: '/projects/federated-learning.png', caption: 'Federated Architecture' }],
        metrics: [
            { label: 'Hospitals', value: '3' },
            { label: 'Accuracy', value: '94%' },
            { label: 'Privacy', value: 'ε=0.1' },
            { label: 'Models', value: '5+' }
        ],
        created_at: '2023-07-01',
    },
};

async function getProject(slug: string): Promise<Project | null> {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('slug', slug)
            .single();

        if (data && !error) {
            return data as Project;
        }
    } catch (error) {
        console.error('Error fetching project from Supabase:', error);
    }

    // Return static project data as fallback only if DB fails
    return staticProjects[slug] || null;
}

export default async function ProjectDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const project = await getProject(slug);

    if (!project) {
        notFound();
    }

    // Helper to get first image or fallback
    const getProjectImage = () => {
        if (project.images && project.images.length > 0) {
            return project.images[0].url;
        }
        return `/projects/${project.slug}.png`;
    };

    // Helper to render markdown-like content
    const renderContent = (content: string | null) => {
        if (!content) return null;
        return content.split('\n').map((line, i) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('##')) {
                return <h2 key={i} className="text-2xl font-bold mt-8 mb-4">{trimmed.replace('##', '').trim()}</h2>;
            }
            if (trimmed.startsWith('-')) {
                return <li key={i} className="ml-4 mb-2">{trimmed.replace('-', '').trim()}</li>;
            }
            if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                return <p key={i} className="font-bold mb-2">{trimmed.replace(/\*\*/g, '')}</p>;
            }
            if (trimmed) {
                return <p key={i} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">{line}</p>;
            }
            return null;
        });
    };

    const year = new Date(project.created_at).getFullYear();

    return (
        <div className="container mx-auto px-4 py-20">
            <Link href="/projects" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-8 transition">
                <FiArrowLeft className="mr-2" /> Back to Projects
            </Link>

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                    {project.is_featured && (
                        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-bold">
                            ⭐ Featured
                        </span>
                    )}
                    {project.visibility === 'gated' && (
                        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-bold flex items-center gap-1">
                            <FiLock size={12} /> Gated Access
                        </span>
                    )}
                    {project.visibility === 'nda' && (
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-bold">
                            🔒 NDA
                        </span>
                    )}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-6">{project.title}</h1>

                <div className="flex flex-wrap gap-4 mb-8">
                    {project.tags?.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                            {tag}
                        </span>
                    ))}
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                        {year}
                    </span>
                </div>

                {/* Project Image */}
                <div className="w-full aspect-video bg-gray-900 rounded-2xl mb-12 overflow-hidden shadow-2xl relative group">
                    <img
                        src={getProjectImage()}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                </div>

                {/* Metrics */}
                {project.metrics && project.metrics.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        {project.metrics.map((metric, idx) => (
                            <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-center">
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metric.value}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid md:grid-cols-[1fr_300px] gap-12">
                    <div className="prose dark:prose-invert max-w-none">
                        {/* Short Description */}
                        {project.short_description && (
                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                {project.short_description}
                            </p>
                        )}

                        {/* Problem Statement */}
                        {project.problem_statement && (
                            <>
                                <h2 className="text-2xl font-bold mt-8 mb-4">Problem Statement</h2>
                                {renderContent(project.problem_statement)}
                            </>
                        )}

                        {/* Approach */}
                        {project.approach && (
                            <>
                                <h2 className="text-2xl font-bold mt-8 mb-4">Approach & Methodology</h2>
                                {renderContent(project.approach)}
                            </>
                        )}

                        {/* Results */}
                        {project.results && (
                            <>
                                <h2 className="text-2xl font-bold mt-8 mb-4">Results & Impact</h2>
                                {renderContent(project.results)}
                            </>
                        )}

                        {/* Full Description */}
                        {project.full_description && (
                            <>
                                <h2 className="text-2xl font-bold mt-8 mb-4">Details</h2>
                                {renderContent(project.full_description)}
                            </>
                        )}

                        {/* Limitations */}
                        {project.limitations && (
                            <>
                                <h2 className="text-2xl font-bold mt-8 mb-4">Limitations & Future Work</h2>
                                {renderContent(project.limitations)}
                            </>
                        )}

                        {/* Code Section - Gated */}
                        {project.visibility === 'gated' && (
                            <div className="mt-12">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <FiLock className="text-amber-500" /> Source Code
                                </h2>
                                <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                    {/* Blurred Code Preview */}
                                    <div className="blur-sm select-none pointer-events-none">
                                        <pre className="p-6 bg-gray-900 text-gray-300 text-sm font-mono overflow-hidden">
                                            {`# model.py - Neural Network Implementation
import torch
import torch.nn as nn

class BrainTumorNet(nn.Module):
    def __init__(self, in_channels=4, out_channels=4):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Conv3d(in_channels, 64, 3, padding=1),
            nn.BatchNorm3d(64),
            nn.ReLU(inplace=True),
            # More layers...
        )
        self.decoder = nn.Sequential(
            nn.ConvTranspose3d(512, 256, 2, stride=2),
            # ...
        )
    
    def forward(self, x):
        features = self.encoder(x)
        return self.decoder(features)`}
                                        </pre>
                                    </div>
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/80 to-gray-900/60 flex flex-col items-center justify-center text-center p-8">
                                        <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
                                            <FiLock className="text-amber-400 text-2xl" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Access Required</h3>
                                        <p className="text-gray-300 mb-6 max-w-md">
                                            This source code is available to approved researchers and collaborators.
                                            Request access to view the full implementation.
                                        </p>
                                        <Link href={`/gated/${project.slug}`}>
                                            <Button className="flex items-center gap-2">
                                                <FiLock /> Request Access
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* GitHub Integration */}
                        <ProjectGitHubSection
                            githubLink={project.github_link}
                            visibility={project.visibility}
                            projectSlug={project.slug}
                        />

                        {/* Category */}
                        {project.category && project.category.length > 0 && (
                            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                                <h3 className="font-bold mb-4">Categories</h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.category.map(cat => (
                                        <span key={cat} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {project.visibility === 'gated' ? (
                            <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                <h3 className="font-bold mb-2 text-amber-800 dark:text-amber-300 flex items-center gap-2">
                                    <FiLock className="text-amber-600" /> Request Access
                                </h3>
                                <p className="text-sm text-amber-700 dark:text-amber-200 mb-4">
                                    This project has gated content. Request access to view source code and datasets.
                                </p>
                                <Link href={`/gated/${project.slug}`}>
                                    <Button size="sm" className="w-full">Request Access</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <h3 className="font-bold mb-2 text-blue-800 dark:text-blue-300">Interested in this work?</h3>
                                <p className="text-sm text-blue-700 dark:text-blue-200 mb-4">
                                    Contact me to discuss potential collaboration opportunities.
                                </p>
                                <Link href="/contact">
                                    <Button size="sm" className="w-full">Contact Me</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
