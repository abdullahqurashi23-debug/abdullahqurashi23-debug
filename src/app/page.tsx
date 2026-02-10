'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiGithub, FiLinkedin, FiMail, FiAward, FiCode, FiBriefcase, FiExternalLink } from 'react-icons/fi';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';

export default function Home() {
  // Animation variants with reduced motion support
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Featured research areas
  const researchAreas = [
    {
      icon: '🏥',
      title: 'Medical Imaging AI',
      description: 'Developing diagnostic models for medical imaging, patient risk stratification, and personalized treatment plans using Deep Learning.',
      color: 'blue',
      gradient: 'from-blue-500/20 to-blue-600/10',
    },
    {
      icon: '🧠',
      title: 'EEG & Brain-Computer Interfaces',
      description: 'Analyzing EEG signals for brain-computer interfaces, decoding intent from neural activity for assistive technologies.',
      color: 'purple',
      gradient: 'from-purple-500/20 to-purple-600/10',
    },
    {
      icon: '🔐',
      title: 'Privacy-Preserving ML',
      description: 'Building federated learning systems for decentralized medical data analysis without exposing sensitive patient information.',
      color: 'emerald',
      gradient: 'from-emerald-500/20 to-emerald-600/10',
    },
  ];

  // Trust strip items
  const trustItems = [
    { icon: <FiAward />, label: 'Research Publications' },
    { icon: <FiCode />, label: 'Open Source Projects' },
    { icon: <FiBriefcase />, label: 'Industry Experience' },
  ];

  // Featured projects (static for now, will be fetched from Supabase)
  const featuredProjects = [
    {
      slug: 'thought-viz',
      title: 'Thought Viz: EEG-Driven Visual Reconstruction',
      description: 'Novel BCI pipeline for reconstructing visual scenes from EEG signals using adaptive encoder-decoder architecture with diffusion models. 78% accuracy achieved.',
      image: '/projects/thought-viz.png',
      tags: ['BCI', 'Deep Learning', 'EEG', 'Signal Processing'],
      visibility: 'public',
    },
    {
      slug: 'brain-tumor-segmentation',
      title: 'Brain Tumor Segmentation',
      description: 'U-Net based architecture achieving 98.2% dice coefficient on BRATS dataset for automated tumor detection and clinical deployment.',
      image: '/projects/brain-tumor.png',
      tags: ['Medical Imaging', 'Segmentation', 'U-Net'],
      visibility: 'public',
    },
    {
      slug: 'ivf-expert-fusion',
      title: 'Expert Fusion Network for IVF',
      description: 'Multi-architecture deep learning framework combining U-Net, attention mechanisms, and mixture-of-experts achieving 98% accuracy in embryo morphology grading.',
      image: '/projects/ivf-fusion.png',
      tags: ['Healthcare AI', 'Deep Learning', 'IVF'],
      visibility: 'gated',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid-fade opacity-50" />

        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px]" />

        <div className="container mx-auto px-6 py-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-[var(--brand-primary)]">Available for Collaboration</span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight leading-tight">
                AI Researcher in{' '}
                <span className="text-gradient">Healthcare</span>
              </h1>

              <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-xl leading-relaxed">
                Specializing in <strong className="text-[var(--text-primary)]">Brain-Computer Interfaces</strong>,
                <strong className="text-[var(--text-primary)]"> Computer Vision</strong>, and
                <strong className="text-[var(--text-primary)]"> Healthcare AI</strong>.
                Bridging the gap between biological signals and artificial intelligence.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/projects"
                  className="btn btn-primary group"
                >
                  View Projects
                  <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/contact"
                  className="btn btn-secondary"
                >
                  Let's Collaborate
                </Link>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4 pt-4">
                <span className="text-sm text-[var(--text-muted)]">Connect:</span>
                <div className="flex gap-3">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:bg-[var(--surface)] transition-all"
                    aria-label="GitHub"
                  >
                    <FiGithub size={20} />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:bg-[var(--surface)] transition-all"
                    aria-label="LinkedIn"
                  >
                    <FiLinkedin size={20} />
                  </a>
                  <a
                    href="mailto:emal@example.com"
                    className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:bg-[var(--surface)] transition-all"
                    aria-label="Email"
                  >
                    <FiMail size={20} />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Right - Hero Visual */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="relative aspect-square max-w-lg mx-auto">
                {/* Decorative border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--brand-primary)] via-purple-500 to-cyan-500 p-[2px]">
                  <div className="w-full h-full rounded-3xl bg-[var(--background)]" />
                </div>

                {/* Image */}
                <div className="absolute inset-2 rounded-2xl overflow-hidden">
                  <img
                    src="/projects/thought-viz.png"
                    alt="Brain Computer Interface Research"
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/80 via-transparent to-transparent" />
                </div>

                {/* Floating Stats Card */}
                <motion.div
                  className="absolute -bottom-6 -left-6 p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center text-[var(--brand-primary)]">
                      <FiCode size={24} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[var(--text-primary)]">10+</p>
                      <p className="text-sm text-[var(--text-muted)]">Research Projects</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Badge */}
                <motion.div
                  className="absolute -top-4 -right-4 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  🎓 Researcher
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {trustItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-[var(--text-secondary)]">
                <span className="text-[var(--brand-primary)]">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Competencies */}
      <motion.section
        className="py-24 bg-[var(--background)]"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-6">
          <motion.div variants={staggerItem} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Research Focus</h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Bridging cutting-edge AI with real-world healthcare applications
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {researchAreas.map((area, index) => (
              <motion.div key={index} variants={staggerItem}>
                <Card className="h-full" hover>
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${area.gradient} flex items-center justify-center text-3xl mb-6`}>
                    {area.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                    {area.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {area.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Featured Projects */}
      <motion.section
        className="py-24 bg-[var(--surface)]"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <motion.div variants={staggerItem}>
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-3">Featured Research</h2>
              <p className="text-[var(--text-secondary)]">Highlights from my recent work</p>
            </motion.div>
            <motion.div variants={staggerItem}>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-[var(--brand-primary)] font-medium hover:gap-3 transition-all"
              >
                View All Projects <FiArrowRight />
              </Link>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project, index) => (
              <motion.div key={project.slug} variants={staggerItem}>
                <Link href={`/projects/${project.slug}`}>
                  <Card className="h-full overflow-hidden group cursor-pointer" hover>
                    {/* Image */}
                    <div className="aspect-video -mx-6 -mt-6 mb-6 overflow-hidden relative">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Visibility Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`badge ${project.visibility === 'public' ? 'badge-public' : 'badge-gated'}`}>
                          {project.visibility === 'public' ? 'Public' : 'Gated'}
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag) => (
                        <span key={tag} className="badge badge-primary">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--brand-primary)] transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-[var(--text-secondary)] line-clamp-2 mb-4">
                      {project.description}
                    </p>

                    {/* Link */}
                    <span className="inline-flex items-center gap-1 text-[var(--brand-primary)] font-medium text-sm">
                      Learn More <FiExternalLink size={14} />
                    </span>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="py-24 bg-[var(--background)] relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--brand-primary)]/10 rounded-full blur-[150px]" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-6">
              Interested in Collaboration?
            </h2>
            <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-2xl mx-auto">
              Whether it's research collaboration, consulting on AI projects, or discussing new opportunities —
              I'd love to hear from you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="btn btn-primary">
                Get in Touch <FiArrowRight />
              </Link>
              <Link href="/services" className="btn btn-secondary">
                View Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
