'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiGithub, FiLinkedin, FiMail, FiArrowUpRight } from 'react-icons/fi';

export default function Footer() {
    const pathname = usePathname();
    const currentYear = new Date().getFullYear();

    if (pathname && pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <footer className="bg-[var(--surface)] border-t border-[var(--border)] mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
                    {/* About */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-3 mb-4 group">
                            {/* Modern Logo with Gradient Border - matching header */}
                            <div className="relative w-11 h-11 transition-all duration-500 group-hover:scale-105">
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--brand-primary)] via-purple-500 to-cyan-400 p-[2px] opacity-80 group-hover:opacity-100 transition-opacity">
                                    <div className="w-full h-full rounded-xl bg-[var(--surface-elevated)] flex items-center justify-center">
                                        <span className="text-lg font-bold bg-gradient-to-br from-[var(--brand-primary)] to-purple-500 bg-clip-text text-transparent">
                                            EK
                                        </span>
                                    </div>
                                </div>
                                <div className="absolute inset-0 rounded-xl bg-[var(--brand-primary)] opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold font-display text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                                    Emal Kamawal
                                </span>
                                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">AI Researcher</span>
                            </div>
                        </Link>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                            AI Researcher focused on healthcare applications, computer vision,
                            and brain-computer interfaces.
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-3 mt-6">
                            <a
                                href="https://github.com/emal"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-all"
                                aria-label="GitHub"
                            >
                                <FiGithub size={18} />
                            </a>
                            <a
                                href="https://linkedin.com/in/emal"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-all"
                                aria-label="LinkedIn"
                            >
                                <FiLinkedin size={18} />
                            </a>
                            <a
                                href="mailto:B22F1813CS118@fecid.paf-iast.edu.pk"
                                className="p-2.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-all"
                                aria-label="Email"
                            >
                                <FiMail size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-[var(--text-primary)] mb-4">Quick Links</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/projects" className="text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors inline-flex items-center gap-1">
                                    Projects <FiArrowUpRight size={12} />
                                </Link>
                            </li>
                            <li>
                                <Link href="/publications" className="text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors inline-flex items-center gap-1">
                                    Publications <FiArrowUpRight size={12} />
                                </Link>
                            </li>
                            <li>
                                <Link href="/experience" className="text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors inline-flex items-center gap-1">
                                    Experience <FiArrowUpRight size={12} />
                                </Link>
                            </li>
                            <li>
                                <Link href="/services" className="text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors inline-flex items-center gap-1">
                                    Services <FiArrowUpRight size={12} />
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors inline-flex items-center gap-1">
                                    Contact <FiArrowUpRight size={12} />
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Research Areas */}
                    <div>
                        <h4 className="font-semibold text-[var(--text-primary)] mb-4">Research Areas</h4>
                        <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)]"></span>
                                Medical Imaging AI
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                EEG/Brain-Computer Interfaces
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                                Computer Vision
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Privacy-Preserving ML
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                Explainable AI
                            </li>
                        </ul>
                    </div>

                    {/* Contact CTA */}
                    <div>
                        <h4 className="font-semibold text-[var(--text-primary)] mb-4">Let's Collaborate</h4>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">
                            Interested in research collaboration, consulting, or just want to connect?
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--brand-primary)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--brand-primary-hover)] transition-all"
                        >
                            Get in Touch
                            <FiArrowUpRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-[var(--border)] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[var(--text-muted)]">
                    <p>&copy; {currentYear} Emal Kamawal. All rights reserved.</p>
                    <div className="flex gap-6">
                        <span>Built with ❤️ for AI Research</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
