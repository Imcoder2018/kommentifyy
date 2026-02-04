'use client';

export default function ComparisonTable() {
    return (
        <section id="comparison" style={{ padding: '100px 60px', background: '#f8f9fb' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '42px', fontWeight: 'bold', textAlign: 'center', color: '#693fe9', marginBottom: '20px' }}>
                    🔎 Competitor Comparison — Kommentify vs Other LinkedIn Automation Tools
                </h2>
                <p style={{ textAlign: 'center', fontSize: '18px', color: '#666', marginBottom: '60px' }}>
                    Why Kommentify is the All-in-One LinkedIn Growth Suite
                </p>

                <div style={{ overflowX: 'auto', marginBottom: '60px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden', minWidth: '900px' }}>
                        <thead>
                            <tr style={{ background: '#693fe9', color: 'white' }}>
                                <th style={{ padding: '20px', textAlign: 'left', fontWeight: '600', minWidth: '250px' }}>Feature / Tool</th>
                                <th style={{ padding: '20px', textAlign: 'center', fontWeight: '600', background: '#5b7dff', minWidth: '180px' }}>Kommentify</th>
                                <th style={{ padding: '20px', textAlign: 'center', fontWeight: '600', minWidth: '150px' }}>Octopus CRM</th>
                                <th style={{ padding: '20px', textAlign: 'center', fontWeight: '600', minWidth: '150px' }}>Linked Helper</th>
                                <th style={{ padding: '20px', textAlign: 'center', fontWeight: '600', minWidth: '150px' }}>Dripify</th>
                                <th style={{ padding: '20px', textAlign: 'center', fontWeight: '600', minWidth: '150px' }}>Meet Alfred</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { feature: 'Monthly Price (base plan)', kommentify: '$4.99/mo (Starter)', octopus: '~$6.99–$9.99/mo', linked: '~$15/mo (Standard)', dripify: '~$39–$59/mo', alfred: '~$59/mo' },
                                { feature: 'Core Automation (connect, follow, invite)', kommentify: '✅ Full automation with safety limits & human-like behavior', octopus: '✅ Basic outreach & CRM workflows', linked: '✅ Automation of LinkedIn tasks', dripify: '✅ Campaign automation & drip sequences', alfred: '✅ Multi-channel (LinkedIn + Email + Twitter)' },
                                { feature: 'AI-powered Post Writing + Scheduling', kommentify: '✅ Yes — post generation + scheduling + human delays', octopus: '❌ No', linked: '❌ No', dripify: '❌ No', alfred: '❌ No' },
                                { feature: 'Automated Intelligent Commenting + Engagement', kommentify: '✅ Yes — reads posts, filters, auto-comments + like/share', octopus: '❌ No', linked: '❌ No', dripify: '❌ No', alfred: '❌ No' },
                                { feature: 'Manual Import & Target List Engagement', kommentify: '✅ Yes — upload list + automate full engagement', octopus: 'Limited / basic lead management', linked: 'Basic campaign management', dripify: 'Outreach + sequences only', alfred: 'Multi-channel CRM outreach' },
                                { feature: 'Granular Limit & Delay Controls (safety)', kommentify: '✅ Yes — custom delays, human-behavior simulation, safe-limit presets', octopus: 'Basic automation', linked: 'Some delay controls', dripify: 'Standard automation', alfred: 'Generic automation' },
                                { feature: 'Ideal For', kommentify: '✅ Full automation + content + engagement + growth + safety', octopus: 'Simple CRM/outreach at low cost', linked: 'Budget automation for basic tasks', dripify: 'Drip campaigns & messaging', alfred: 'Multi-channel outreach & CRM' }
                            ].map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #e0e6ed' }}>
                                    <td style={{ padding: '16px 20px', fontWeight: '600', color: '#693fe9' }}>{row.feature}</td>
                                    <td style={{ padding: '16px 20px', textAlign: 'center', background: 'rgba(91, 125, 255, 0.1)', fontWeight: '600', color: '#693fe9', fontSize: '14px' }}>{row.kommentify}</td>
                                    <td style={{ padding: '16px 20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>{row.octopus}</td>
                                    <td style={{ padding: '16px 20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>{row.linked}</td>
                                    <td style={{ padding: '16px 20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>{row.dripify}</td>
                                    <td style={{ padding: '16px 20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>{row.alfred}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Key Takeaway */}
                <div style={{ background: 'linear-gradient(135deg, rgba(91, 125, 255, 0.1), rgba(40, 167, 69, 0.05))', border: '3px solid #5b7dff', borderRadius: '20px', padding: '40px', textAlign: 'center', marginBottom: '60px' }}>
                    <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#693fe9', marginBottom: '20px' }}>
                        ✅ What This Comparison Shows
                    </h3>
                    <div style={{ textAlign: 'left', maxWidth: '900px', margin: '0 auto' }}>
                        <ul style={{ fontSize: '16px', color: '#666', lineHeight: '1.8', paddingLeft: '20px' }}>
                            <li style={{ marginBottom: '12px' }}><strong>Kommentify is not just a "CRM outreach" tool</strong> — it's a full LinkedIn growth automation suite with post creation, scheduling, comments, likes, shares, smart engagement, imports, analytics, and human-like behavioral automation.</li>
                            <li style={{ marginBottom: '12px' }}><strong>Better Value at Lower Price Point:</strong> Even in the Starter tier, Kommentify gives more functionality than many competitors at higher monthly prices.</li>
                            <li style={{ marginBottom: '12px' }}><strong>Unique Selling Proposition (USP):</strong> Solves more problems (content + engagement + growth + automation + safety) than competitors.</li>
                            <li><strong>Helps Users Decide Immediately:</strong> Clear comparison cuts through confusion — you get more for less.</li>
                        </ul>
                    </div>
                </div>

                {/* Feature Comparison Table */}
                <h3 style={{ fontSize: '32px', fontWeight: 'bold', textAlign: 'center', color: '#693fe9', marginBottom: '40px', marginTop: '80px' }}>
                    Detailed Feature Comparison
                </h3>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
                        <thead>
                            <tr style={{ background: '#693fe9', color: 'white' }}>
                                <th style={{ padding: '20px', textAlign: 'left', fontWeight: '600' }}>Feature</th>
                                <th style={{ padding: '20px', textAlign: 'center', fontWeight: '600' }}>Starter</th>
                                <th style={{ padding: '20px', textAlign: 'center', fontWeight: '600', background: '#5b7dff' }}>Growth</th>
                                <th style={{ padding: '20px', textAlign: 'center', fontWeight: '600' }}>Pro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { feature: 'Monthly Price', starter: '$4.99/mo', growth: '$11.99/mo', pro: '$24.99/mo' },
                                { feature: 'Annual Price', starter: '$49/year', growth: '$99/year', pro: '$199/year' },
                                { feature: 'Lifetime Deal', starter: '$29 once', growth: '$49 once', pro: '$99 once' },
                                { feature: 'Money-Back Guarantee', starter: '30 Days', growth: '30 Days', pro: '30 Days' },
                                { feature: 'AI-Written Posts', starter: '15 (No scheduling)', growth: '40 (Scheduling included)', pro: '100 (Scheduling included)' },
                                { feature: 'Topics per Month', starter: '20', growth: '60', pro: '150' },
                                { feature: 'Auto Comments', starter: '200', growth: '500', pro: '1,000' },
                                { feature: 'Auto Likes', starter: '500', growth: '1,000', pro: 'Unlimited' },
                                { feature: 'Auto Shares', starter: '500', growth: '1,000', pro: 'Unlimited' },
                                { feature: 'Auto Follows', starter: '500', growth: '1,000', pro: 'Unlimited' },
                                { feature: 'Connection Requests', starter: '100', growth: '250', pro: 'Unlimited' },
                                { feature: 'Import Profiles', starter: '—', growth: '500', pro: 'Unlimited' },
                                { feature: 'Smart Human-Like Behavior', starter: '✅', growth: '✅', pro: '✅' },
                                { feature: 'Custom Delay Controls', starter: '✅', growth: '✅', pro: '✅' },
                                { feature: 'Keyword-Based Auto Engagement', starter: '✅', growth: '✅', pro: '✅' },
                                { feature: 'Personalized Connection Messages', starter: '✅', growth: '✅', pro: '✅' },
                                { feature: 'Auto-Scroll, Auto-Read, Auto-Comment', starter: '✅', growth: '✅', pro: '✅' },
                                { feature: 'Engage Saved Profiles List', starter: '—', growth: '✅', pro: '✅' },
                                { feature: 'Enriched Analytics', starter: '—', growth: '✅', pro: '✅' },
                                { feature: 'Priority Support', starter: '—', growth: '✅', pro: '✅' }
                            ].map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #e0e6ed' }}>
                                    <td style={{ padding: '16px', fontWeight: '600', color: '#693fe9' }}>{row.feature}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', color: '#666' }}>{row.starter}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', background: 'rgba(91, 125, 255, 0.05)', fontWeight: '600', color: '#693fe9' }}>{row.growth}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', color: '#666' }}>{row.pro}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
