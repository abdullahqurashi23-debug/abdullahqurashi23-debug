import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const title = searchParams.get('title') || 'Emal Kamawal';
        const description = searchParams.get('description') || 'AI Researcher in Healthcare';
        const type = searchParams.get('type') || 'default'; // project, blog, default
        const category = searchParams.get('category') || '';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-end',
                        backgroundImage: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 50%, #1e293b 100%)',
                        padding: '60px 80px',
                        fontFamily: 'system-ui, sans-serif',
                    }}
                >
                    {/* Background pattern */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.15) 0%, transparent 50%)',
                        }}
                    />

                    {/* Category badge */}
                    {category && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '20px',
                            }}
                        >
                            <div
                                style={{
                                    padding: '8px 16px',
                                    background: 'rgba(59, 130, 246, 0.3)',
                                    borderRadius: '20px',
                                    color: '#93c5fd',
                                    fontSize: '18px',
                                    fontWeight: 600,
                                }}
                            >
                                {type === 'project' ? '🔬' : type === 'blog' ? '📝' : '👤'} {category}
                            </div>
                        </div>
                    )}

                    {/* Title */}
                    <div
                        style={{
                            fontSize: title.length > 40 ? '48px' : '64px',
                            fontWeight: 800,
                            color: 'white',
                            lineHeight: 1.2,
                            marginBottom: '20px',
                            maxWidth: '900px',
                            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
                        }}
                    >
                        {title}
                    </div>

                    {/* Description */}
                    {description && (
                        <div
                            style={{
                                fontSize: '24px',
                                color: '#94a3b8',
                                maxWidth: '800px',
                                lineHeight: 1.5,
                                marginBottom: '40px',
                            }}
                        >
                            {description.length > 120 ? description.substring(0, 120) + '...' : description}
                        </div>
                    )}

                    {/* Footer */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            paddingTop: '30px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                            }}
                        >
                            {/* Avatar placeholder */}
                            <div
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '25px',
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px',
                                    color: 'white',
                                    fontWeight: 700,
                                }}
                            >
                                EK
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <div style={{ color: 'white', fontSize: '20px', fontWeight: 600 }}>
                                    Emal Kamawal
                                </div>
                                <div style={{ color: '#64748b', fontSize: '16px' }}>
                                    AI Researcher in Healthcare
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                color: '#64748b',
                                fontSize: '16px',
                            }}
                        >
                            emalkamawal.com
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e) {
        console.error('OG Image generation error:', e);
        return new Response('Failed to generate image', { status: 500 });
    }
}
