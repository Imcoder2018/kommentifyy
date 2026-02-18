'use client';
import React from 'react';
import { IconAlert, IconChart, IconCheck, IconClock, IconEdit, IconRocket, IconSave, IconShare, IconSliders, IconTarget, IconThumbsUp, IconTimer, IconUsers, IconZap, IconMessage } from './Icons';

export default function LimitsTab() {
    const handleCommentLimitChange = (val: number) => {
        const input = document.getElementById('daily-comment-limit-input') as HTMLInputElement;
        const display = document.getElementById('daily-comment-limit-display');
        if (input && display) {
            input.value = val.toString();
            display.textContent = val.toString();
        }
    };

    const handleLikeLimitChange = (val: number) => {
        const input = document.getElementById('daily-like-limit-input') as HTMLInputElement;
        const display = document.getElementById('daily-like-limit-display');
        if (input && display) {
            input.value = val.toString();
            display.textContent = val.toString();
        }
    };

    const handleShareLimitChange = (val: number) => {
        const input = document.getElementById('daily-share-limit-input') as HTMLInputElement;
        const display = document.getElementById('daily-share-limit-display');
        if (input && display) {
            input.value = val.toString();
            display.textContent = val.toString();
        }
    };

    const handleFollowLimitChange = (val: number) => {
        const input = document.getElementById('daily-follow-limit-input') as HTMLInputElement;
        const display = document.getElementById('daily-follow-limit-display');
        if (input && display) {
            input.value = val.toString();
            display.textContent = val.toString();
        }
    };

    return (
        <div className="card" style={{background:"linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"15px",paddingBottom:"12px",borderBottom:"2px solid #e0e0e0"}}>
                <div>
                    <h4 style={{margin:"0 0 4px 0"}}>
                        <IconAlert size={14} /> Daily Limits & Delays
                    </h4>
                    <small style={{color:"#666"}}>LinkedIn-safe automation limits and timing controls</small>
                </div>
                <select id="account-type" style={{padding:"6px 10px",fontSize:"11px",border:"2px solid #e0e0e0",borderRadius:"4px",background:"white"}}>
                    <option value="your-choice">Custom (Your Settings)</option>
                    <option value="new-conservative">New Account (0-2 weeks)</option>
                    <option value="new-moderate">New Account (2-8 weeks)</option>
                    <option value="matured-safe">Matured (Safe - Recommended)</option>
                    <option value="matured-aggressive">Matured (Faster)</option>
                    <option value="premium-user">LinkedIn Premium</option>
                    <option value="sales-navigator">Sales Navigator</option>
                    <option value="speed-mode">Speed Mode (Use Carefully)</option>
                </select>
            </div>

            <div style={{background:"#f0f8ff",padding:"8px 12px",borderRadius:"6px",marginBottom:"12px",fontSize:"11px",display:"flex",justifyContent:"space-around",flexWrap:"wrap",gap:"8px"}}>
                <span><IconMessage size={14} /> Comments: <strong id="limit-comments" style={{color:"#693fe9"}}>0/99</strong></span>
                <span><IconThumbsUp size={14} /> Likes: <strong id="limit-likes" style={{color:"#693fe9"}}>0/99</strong></span>
                <span><IconShare size={14} /> Shares: <strong id="limit-shares" style={{color:"#693fe9"}}>0/99</strong></span>
                <span><IconUsers size={14} /> Follows: <strong id="limit-follows" style={{color:"#693fe9"}}>0/99</strong></span>
            </div>

            <div style={{background:"white",padding:"12px",borderRadius:"8px",marginBottom:"12px",border:"2px solid #e0e0e0"}}>
                <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}>
                    <span style={{fontSize:"16px"}}><IconChart size={14} /></span>
                    <strong style={{color:"#693fe9",fontSize:"13px"}}>Daily Limits (Stops when reached)</strong>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
                    <div>
                        <label style={{display:"block",fontSize:"11px",color:"#666",fontWeight:600,marginBottom:"6px"}}>
                            <IconMessage size={14} /> Comments Limit:
                        </label>
                        <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                            {[0, 10, 20, 30, 50, 75, 100, 150].map(val => (
                                <button key={val} onClick={() => handleCommentLimitChange(val)}
                                    style={{padding:"6px 10px",border:"1px solid #e0e0e0",borderRadius:"4px",background:"white",color:"#333",fontSize:"11px",cursor:"pointer",transition:"all 0.2s"}}>
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label style={{display:"block",fontSize:"11px",color:"#666",fontWeight:600,marginBottom:"6px"}}>
                            <IconThumbsUp size={14} /> Likes Limit:
                        </label>
                        <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                            {[0, 25, 50, 75, 100, 150, 200, 300].map(val => (
                                <button key={val} onClick={() => handleLikeLimitChange(val)}
                                    style={{padding:"6px 10px",border:"1px solid #e0e0e0",borderRadius:"4px",background:"white",color:"#333",fontSize:"11px",cursor:"pointer",transition:"all 0.2s"}}>
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label style={{display:"block",fontSize:"11px",color:"#666",fontWeight:600,marginBottom:"6px"}}>
                            <IconShare size={14} /> Shares Limit:
                        </label>
                        <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                            {[0, 5, 10, 15, 20, 25, 30, 50].map(val => (
                                <button key={val} onClick={() => handleShareLimitChange(val)}
                                    style={{padding:"6px 10px",border:"1px solid #e0e0e0",borderRadius:"4px",background:"white",color:"#333",fontSize:"11px",cursor:"pointer",transition:"all 0.2s"}}>
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label style={{display:"block",fontSize:"11px",color:"#666",fontWeight:600,marginBottom:"6px"}}>
                            <IconUsers size={14} /> Follows Limit:
                        </label>
                        <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                            {[0, 10, 20, 30, 40, 50, 75, 100].map(val => (
                                <button key={val} onClick={() => handleFollowLimitChange(val)}
                                    style={{padding:"6px 10px",border:"1px solid #e0e0e0",borderRadius:"4px",background:"white",color:"#333",fontSize:"11px",cursor:"pointer",transition:"all 0.2s"}}>
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{background:"white",padding:"12px",borderRadius:"8px",marginBottom:"12px",border:"2px solid #e0e0e0"}}>
                <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}>
                    <span style={{fontSize:"16px"}}><IconClock size={14} /></span>
                    <strong style={{color:"#693fe9",fontSize:"13px"}}>Starting Delays</strong>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"12px"}}>
                    <div>
                        <label style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px",fontSize:"11px",color:"#666",fontWeight:600}}>
                            <span>Automation Start:</span>
                            <strong id="automation-start-delay-display" style={{color:"#693fe9",fontSize:"12px"}}>30s</strong>
                        </label>
                        <input type="range" id="automation-start-delay" min="0" max="300" value="30" style={{width:"100%"}} />
                        <small style={{color:"#999",fontSize:"10px"}}>Before starting automation</small>
                    </div>
                    <div>
                        <label style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px",fontSize:"11px",color:"#666",fontWeight:600}}>
                            <span>Networking Start:</span>
                            <strong id="networking-start-delay-display" style={{color:"#693fe9",fontSize:"12px"}}>30s</strong>
                        </label>
                        <input type="range" id="networking-start-delay" min="0" max="300" value="30" style={{width:"100%"}} />
                        <small style={{color:"#999",fontSize:"10px"}}>Before starting networking</small>
                    </div>
                    <div>
                        <label style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px",fontSize:"11px",color:"#666",fontWeight:600}}>
                            <span>Import Profiles:</span>
                            <strong id="import-start-delay-display" style={{color:"#693fe9",fontSize:"12px"}}>30s</strong>
                        </label>
                        <input type="range" id="import-start-delay" min="0" max="300" value="30" style={{width:"100%"}} />
                        <small style={{color:"#999",fontSize:"10px"}}>Before starting import</small>
                    </div>
                </div>
            </div>

            <div style={{background:"white",padding:"12px",borderRadius:"8px",marginBottom:"12px",border:"2px solid #e0e0e0"}}>
                <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}>
                    <span style={{fontSize:"16px"}}><IconTimer size={14} /></span>
                    <strong style={{color:"#693fe9",fontSize:"13px"}}>Action Delays</strong>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"12px"}}>
                    <div>
                        <label style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px",fontSize:"11px",color:"#666",fontWeight:600}}>
                            <span>Like Action:</span>
                            <strong id="like-action-delay-display" style={{color:"#693fe9",fontSize:"12px"}}>3s</strong>
                        </label>
                        <input type="range" id="like-action-delay" min="1" max="30" value="3" style={{width:"100%"}} />
                        <small style={{color:"#999",fontSize:"10px"}}>Between likes</small>
                    </div>
                    <div>
                        <label style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px",fontSize:"11px",color:"#666",fontWeight:600}}>
                            <span>Comment Action:</span>
                            <strong id="comment-action-delay-display" style={{color:"#693fe9",fontSize:"12px"}}>8s</strong>
                        </label>
                        <input type="range" id="comment-action-delay" min="1" max="30" value="8" style={{width:"100%"}} />
                        <small style={{color:"#999",fontSize:"10px"}}>Between comments</small>
                    </div>
                    <div>
                        <label style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px",fontSize:"11px",color:"#666",fontWeight:600}}>
                            <span>Follow Action:</span>
                            <strong id="follow-action-delay-display" style={{color:"#693fe9",fontSize:"12px"}}>5s</strong>
                        </label>
                        <input type="range" id="follow-action-delay" min="1" max="30" value="5" style={{width:"100%"}} />
                        <small style={{color:"#999",fontSize:"10px"}}>Between follows</small>
                    </div>
                </div>
            </div>

            <div style={{background:"white",padding:"12px",borderRadius:"8px",marginBottom:"12px",border:"2px solid #e0e0e0"}}>
                <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}>
                    <span style={{fontSize:"16px"}}><IconSliders size={14} /></span>
                    <strong style={{color:"#693fe9",fontSize:"13px"}}>Advanced Settings</strong>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
                    <div>
                        <label style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",fontSize:"11px",color:"#666",fontWeight:600}}>
                            <input type="checkbox" id="enable-random-delays" defaultChecked={true} />
                            <span>Enable Random Delays</span>
                        </label>
                        <small style={{color:"#999",fontSize:"10px"}}>Add randomness to delays for natural behavior</small>
                    </div>
                    <div>
                        <label style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",fontSize:"11px",color:"#666",fontWeight:600}}>
                            <input type="checkbox" id="enable-break-times" defaultChecked={true} />
                            <span>Enable Break Times</span>
                        </label>
                        <small style={{color:"#999",fontSize:"10px"}}>Take breaks during extended sessions</small>
                    </div>
                    <div>
                        <label style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",fontSize:"11px",color:"#666",fontWeight:600}}>
                            <input type="checkbox" id="enable-weekend-mode" defaultChecked={false} />
                            <span>Weekend Mode</span>
                        </label>
                        <small style={{color:"#999",fontSize:"10px"}}>Reduced activity on weekends</small>
                    </div>
                    <div>
                        <label style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",fontSize:"11px",color:"#666",fontWeight:600}}>
                            <input type="checkbox" id="enable-safe-mode" defaultChecked={true} />
                            <span>Safe Mode</span>
                        </label>
                        <small style={{color:"#999",fontSize:"10px"}}>Extra conservative limits</small>
                    </div>
                </div>
            </div>

            <div style={{display:"flex",justifyContent:"flex-end",gap:"10px",marginTop:"20px"}}>
                <button style={{padding:"10px 20px",border:"1px solid #e0e0e0",borderRadius:"6px",background:"white",color:"#666",fontSize:"13px",cursor:"pointer"}}>
                    Reset to Defaults
                </button>
                <button style={{padding:"10px 20px",border:"none",borderRadius:"6px",background:"linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)",color:"white",fontSize:"13px",fontWeight:600,cursor:"pointer"}}>
                    <IconSave size={14} /> Save Settings
                </button>
            </div>
        </div>
    );
}
