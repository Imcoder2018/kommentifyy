'use client';
import React from 'react';
import { IconAlert, IconBot, IconChart, IconCheck, IconClock, IconEdit, IconHourglass, IconLightbulb, IconLink, IconMessage, IconRocket, IconSave, IconShare, IconSliders, IconTarget, IconThumbsUp, IconTimer, IconUser, IconUsers, IconZap } from './Icons';

export default function LimitsTab() {
    return (
        <>
            {/* TAB CONTENT: LIMITS */}
            <div className="card" style={{"background":"linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)"}}>
                {/* Header */}
                <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"15px","paddingBottom":"12px","borderBottom":"2px solid #e0e0e0"}}>
                    <div>
                        <h4 style={{"margin":"0 0 4px 0"}}>
                            <IconAlert size={14} /> Daily Limits & Delays</h4>
                            <small style={{"color":"#666"}}>LinkedIn-safe automation limits and timing controls</small>
                        </div>
                        <select id="account-type" style={{"padding":"6px 10px","fontSize":"11px","border":"2px solid #e0e0e0","borderRadius":"4px","background":"white"}}>
                            <option value="your-choice">
                                <IconSliders size={14} /> Custom (Your Settings)</option>
                                <option value="new-conservative">
                                    <IconZap size={14} /> New Account (0-2 weeks)</option>
                                    <option value="new-moderate">
                                        <IconZap size={14} /> New Account (2-8 weeks)</option>
                                        <option value="matured-safe">
                                            <IconCheck size={14} /> Matured (Safe - Recommended)</option>
                                            <option value="matured-aggressive">
                                                <IconZap size={14} /> Matured (Faster)</option>
                                                <option value="premium-user">
                                                    <IconZap size={14} /> LinkedIn Premium</option>
                                                    <option value="sales-navigator">
                                                        <IconTarget size={14} /> Sales Navigator</option>
                                                        <option value="speed-mode">
                                                            <IconRocket size={14} /> Speed Mode (Use Carefully)</option>
                                                        </select>
                                                    </div>
                                                    {/* Today's Activity */}
                                                    <div style={{"background":"#f0f8ff","padding":"8px 12px","borderRadius":"6px","marginBottom":"12px","fontSize":"11px","display":"flex","justifyContent":"space-around","flexWrap":"wrap","gap":"8px"}}>
                                                        <span>
                                                            <IconMessage size={14} /> Comments: <strong id="limit-comments" style={{"color":"#693fe9"}}>0/99</strong>
                                                        </span>
                                                        <span>
                                                            <IconThumbsUp size={14} /> Likes: <strong id="limit-likes" style={{"color":"#693fe9"}}>0/99</strong>
                                                        </span>
                                                        <span>
                                                            <IconShare size={14} /> Shares: <strong id="limit-shares" style={{"color":"#693fe9"}}>0/99</strong>
                                                        </span>
                                                        <span>
                                                            <IconUsers size={14} /> Follows: <strong id="limit-follows" style={{"color":"#693fe9"}}>0/99</strong>
                                                        </span>
                                                    </div>
                                                    {/* 1. Daily Limits Card */}
                                                    <div style={{"background":"white","padding":"12px","borderRadius":"8px","marginBottom":"12px","border":"2px solid #e0e0e0"}}>
                                                        <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                                            <span style={{"fontSize":"16px"}}>
                                                                <IconChart size={14} />
                                                            </span>
                                                            <strong style={{"color":"#693fe9","fontSize":"13px"}}>Daily Limits (Stops when reached)</strong>
                                                        </div>
                                                        <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"12px"}}>
                                                            <div>
                                                                <label style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px","fontSize":"11px","color":"#666","fontWeight":600}}>
                                                                    <span>
                                                                        <IconMessage size={14} /> Comments Limit:</span>
                                                                        <strong id="daily-comment-limit-display" style={{"color":"#693fe9","fontSize":"12px"}}>30</strong>
                                                                    </label>
                                                                    <input type="range" id="daily-comment-limit-input" min="0" max="200" value="30" style={{"width":"100%"}} />
                                                                </div>
                                                                <div>
                                                                    <label style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px","fontSize":"11px","color":"#666","fontWeight":600}}>
                                                                        <span>
                                                                            <IconThumbsUp size={14} /> Likes Limit:</span>
                                                                            <strong id="daily-like-limit-display" style={{"color":"#693fe9","fontSize":"12px"}}>60</strong>
                                                                        </label>
                                                                        <input type="range" id="daily-like-limit-input" min="0" max="500" value="60" style={{"width":"100%"}} />
                                                                    </div>
                                                                    <div>
                                                                        <label style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px","fontSize":"11px","color":"#666","fontWeight":600}}>
                                                                            <span>
                                                                                <IconShare size={14} /> Shares Limit:</span>
                                                                                <strong id="daily-share-limit-display" style={{"color":"#693fe9","fontSize":"12px"}}>15</strong>
                                                                            </label>
                                                                            <input type="range" id="daily-share-limit-input" min="0" max="100" value="15" style={{"width":"100%"}} />
                                                                        </div>
                                                                        <div>
                                                                            <label style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px","fontSize":"11px","color":"#666","fontWeight":600}}>
                                                                                <span>
                                                                                    <IconUsers size={14} /> Follows Limit:</span>
                                                                                    <strong id="daily-follow-limit-display" style={{"color":"#693fe9","fontSize":"12px"}}>30</strong>
                                                                                </label>
                                                                                <input type="range" id="daily-follow-limit-input" min="0" max="200" value="30" style={{"width":"100%"}} />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {/* 2. Starting Delays Card */}
                                                                    <div style={{"background":"white","padding":"12px","borderRadius":"8px","marginBottom":"12px","border":"2px solid #e0e0e0"}}>
                                                                        <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                                                            <span style={{"fontSize":"16px"}}>
                                                                                <IconClock size={14} />
                                                                            </span>
                                                                            <strong style={{"color":"#693fe9","fontSize":"13px"}}>Starting Delays</strong>
                                                                        </div>
                                                                        <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr 1fr","gap":"12px"}}>
                                                                            <div>
                                                                                <label style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px","fontSize":"11px","color":"#666","fontWeight":600}}>
                                                                                    <span>Automation Start:</span>
                                                                                    <strong id="automation-start-delay-display" style={{"color":"#693fe9","fontSize":"12px"}}>30s</strong>
                                                                                </label>
                                                                                <input type="range" id="automation-start-delay" min="0" max="300" value="30" style={{"width":"100%"}} />
                                                                                <small style={{"color":"#999","fontSize":"10px"}}>Before starting automation</small>
                                                                            </div>
                                                                            <div>
                                                                                <label style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px","fontSize":"11px","color":"#666","fontWeight":600}}>
                                                                                    <span>Networking Start:</span>
                                                                                    <strong id="networking-start-delay-display" style={{"color":"#693fe9","fontSize":"12px"}}>30s</strong>
                                                                                </label>
                                                                                <input type="range" id="networking-start-delay" min="0" max="300" value="30" style={{"width":"100%"}} />
                                                                                <small style={{"color":"#999","fontSize":"10px"}}>Before starting networking</small>
                                                                            </div>
                                                                            <div>
                                                                                <label style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px","fontSize":"11px","color":"#666","fontWeight":600}}>
                                                                                    <span>Import Profiles:</span>
                                                                                    <strong id="import-start-delay-display" style={{"color":"#693fe9","fontSize":"12px"}}>30s</strong>
                                                                                </label>
                                                                                <input type="range" id="import-start-delay" min="0" max="300" value="30" style={{"width":"100%"}} />
                                                                                <small style={{"color":"#999","fontSize":"10px"}}>Before starting import</small>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {/* 3. Post Writer Delays Card */}
                                                                    <div style={{"background":"white","padding":"12px","borderRadius":"8px","marginBottom":"12px","border":"2px solid #e0e0e0"}}>
                                                                        <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                                                            <span style={{"fontSize":"16px"}}>
                                                                                <IconEdit size={14} />
                                                                            </span>
                                                                            <strong style={{"color":"#693fe9","fontSize":"13px"}}>Post Writer Delays</strong>
                                                                        </div>
                                                                        <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"12px"}}>
                                                                            <div>
                                                                                <label style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px","fontSize":"11px","color":"#666","fontWeight":600}}>
                                                                                    <span>After Page Load:</span>
                                                                                    <strong id="post-writer-page-load-delay-display" style={{"color":"#693fe9","fontSize":"12px"}}>15s</strong>
                                                                                </label>
                                                                                <input type="range" id="post-writer-page-load-delay" min="1" max="30" value="15" style={{"width":"100%"}} />
                                                                                <small style={{"color":"#999","fontSize":"10px"}}>After LinkedIn opens</small>
                                                                            </div>
                                                                            <div>
                                                                                <label style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px","fontSize":"11px","color":"#666","fontWeight":600}}>
                                                                                    <span>After Click Button:</span>
                                                                                    <strong id="post-writer-click-delay-display" style={{"color":"#693fe9","fontSize":"12px"}}>8s</strong>
                                                                                </label>
                                                                                <input type="range" id="post-writer-click-delay" min="1" max="30" value="8" style={{"width":"100%"}} />
                                                                                <small style={{"color":"#999","fontSize":"10px"}}>After clicking "Start a post"</small>
                                                                            </div>
                                                                            <div>
                                                                                <label style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px","fontSize":"11px","color":"#666","fontWeight":600}}>
                                                                                    <span>Before Typing:</span>
                                                                                    <strong id="post-writer-typing-delay-display" style={{"color":"#693fe9","fontSize":"12px"}}>10s</strong>
                                                                                </label>
                                                                                <input type="range" id="post-writer-typing-delay" min="1" max="30" value="10" style={{"width":"100%"}} />
                                                                                <small style={{"color":"#999","fontSize":"10px"}}>Before typing content</small>
                                                                            </div>
                                                                            <div>
                                                                                <label style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px","fontSize":"11px","color":"#666","fontWeight":600}}>
                                                                                    <span>Before Submit:</span>
                                                                                    <strong id="post-writer-submit-delay-display" style={{"color":"#693fe9","fontSize":"12px"}}>8s</strong>
                                                                                </label>
                                                                                <input type="range" id="post-writer-submit-delay" min="1" max="30" value="8" style={{"width":"100%"}} />
                                                                                <small style={{"color":"#999","fontSize":"10px"}}>Before clicking post button</small>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {/* 4. Automation Delay Intervals Card */}
                                                                    <div style={{"background":"white","padding":"12px","borderRadius":"8px","marginBottom":"12px","border":"2px solid #e0e0e0"}}>
                                                                        <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                                                            <span style={{"fontSize":"16px"}}>
                                                                                <IconTimer size={14} />
                                                                            </span>
                                                                            <strong style={{"color":"#693fe9","fontSize":"13px"}}>Automation Delay Intervals</strong>
                                                                        </div>
                                                                        <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"12px"}}>
                                                                            {/* Search Delay */}
                                                                            <div>
                                                                                <label style={{"display":"block","marginBottom":"6px","fontSize":"11px","color":"#666","fontWeight":600}}>Search Delay (Between Keywords)</label>
                                                                                <div style={{"display":"flex","gap":"8px"}}>
                                                                                    <div style={{"flex":1}}>
                                                                                        <label style={{"display":"flex","justifyContent":"space-between","fontSize":"10px","color":"#999"}}>
                                                                                            <span>Min</span>
                                                                                            <strong id="search-delay-min-display" style={{"color":"#693fe9"}}>1m 30s</strong>
                                                                                        </label>
                                                                                        <input type="range" id="search-delay-min" min="10" max="300" value="90" style={{"width":"100%"}} />
                                                                                    </div>
                                                                                    <div style={{"flex":1}}>
                                                                                        <label style={{"display":"flex","justifyContent":"space-between","fontSize":"10px","color":"#999"}}>
                                                                                            <span>Max</span>
                                                                                            <strong id="search-delay-max-display" style={{"color":"#693fe9"}}>3m</strong>
                                                                                        </label>
                                                                                        <input type="range" id="search-delay-max" min="30" max="600" value="180" style={{"width":"100%"}} />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            {/* Comment Delay */}
                                                                            <div>
                                                                                <label style={{"display":"block","marginBottom":"6px","fontSize":"11px","color":"#666","fontWeight":600}}>Comment Delay Interval</label>
                                                                                <div style={{"display":"flex","gap":"8px"}}>
                                                                                    <div style={{"flex":1}}>
                                                                                        <label style={{"display":"flex","justifyContent":"space-between","fontSize":"10px","color":"#999"}}>
                                                                                            <span>Min</span>
                                                                                            <strong id="comment-delay-min-display" style={{"color":"#693fe9"}}>2m</strong>
                                                                                        </label>
                                                                                        <input type="range" id="comment-delay-min" min="30" max="600" value="120" style={{"width":"100%"}} />
                                                                                    </div>
                                                                                    <div style={{"flex":1}}>
                                                                                        <label style={{"display":"flex","justifyContent":"space-between","fontSize":"10px","color":"#999"}}>
                                                                                            <span>Max</span>
                                                                                            <strong id="comment-delay-max-display" style={{"color":"#693fe9"}}>5m</strong>
                                                                                        </label>
                                                                                        <input type="range" id="comment-delay-max" min="60" max="1800" value="300" style={{"width":"100%"}} />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {/* 5. Networking Delay Card */}
                                                                    <div style={{"background":"white","padding":"12px","borderRadius":"8px","marginBottom":"12px","border":"2px solid #e0e0e0"}}>
                                                                        <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                                                            <span style={{"fontSize":"16px"}}>
                                                                                <IconLink size={14} />
                                                                            </span>
                                                                            <strong style={{"color":"#693fe9","fontSize":"13px"}}>Networking Delay Intervals</strong>
                                                                        </div>
                                                                        <div>
                                                                            <label style={{"display":"block","marginBottom":"6px","fontSize":"11px","color":"#666","fontWeight":600}}>Connection Request Delay</label>
                                                                            <div style={{"display":"flex","gap":"8px"}}>
                                                                                <div style={{"flex":1}}>
                                                                                    <label style={{"display":"flex","justifyContent":"space-between","fontSize":"10px","color":"#999"}}>
                                                                                        <span>Min</span>
                                                                                        <strong id="networking-delay-min-display" style={{"color":"#693fe9"}}>1m</strong>
                                                                                    </label>
                                                                                    <input type="range" id="networking-delay-min" min="10" max="300" value="60" style={{"width":"100%"}} />
                                                                                </div>
                                                                                <div style={{"flex":1}}>
                                                                                    <label style={{"display":"flex","justifyContent":"space-between","fontSize":"10px","color":"#999"}}>
                                                                                        <span>Max</span>
                                                                                        <strong id="networking-delay-max-display" style={{"color":"#693fe9"}}>2m</strong>
                                                                                    </label>
                                                                                    <input type="range" id="networking-delay-max" min="30" max="600" value="120" style={{"width":"100%"}} />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {/* 6. Post Action Delays Card (3-Column Grid) */}
                                                                    <div style={{"background":"white","padding":"12px","borderRadius":"8px","marginBottom":"12px","border":"2px solid #e0e0e0"}}>
                                                                        <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                                                            <span style={{"fontSize":"16px"}}>
                                                                                <IconHourglass size={14} />
                                                                            </span>
                                                                            <strong style={{"color":"#693fe9","fontSize":"13px"}}>Post Action Delays</strong>
                                                                        </div>
                                                                        <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr 1fr","gap":"10px"}}>
                                                                            <div>
                                                                                <label style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px","fontSize":"10px","color":"#666","fontWeight":600}}>
                                                                                    <span>Before Opening:</span>
                                                                                    <strong id="before-opening-posts-delay-display" style={{"color":"#693fe9","fontSize":"11px"}}>15s</strong>
                                                                                </label>
                                                                                <input type="range" id="before-opening-posts-delay" min="1" max="60" value="15" style={{"width":"100%"}} />
                                                                                <small style={{"color":"#999","fontSize":"9px"}}>After scraping</small>
                                                                            </div>
                                                                            <div>
                                                                                <label style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px","fontSize":"10px","color":"#666","fontWeight":600}}>
                                                                                    <span>After Opening:</span>
                                                                                    <strong id="post-page-load-delay-display" style={{"color":"#693fe9","fontSize":"11px"}}>10s</strong>
                                                                                </label>
                                                                                <input type="range" id="post-page-load-delay" min="1" max="30" value="10" style={{"width":"100%"}} />
                                                                                <small style={{"color":"#999","fontSize":"9px"}}>Page load wait</small>
                                                                            </div>
                                                                            <div>
                                                                                <label style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px","fontSize":"10px","color":"#666","fontWeight":600}}>
                                                                                    <span>Before Liking:</span>
                                                                                    <strong id="before-like-delay-display" style={{"color":"#693fe9","fontSize":"11px"}}>8s</strong>
                                                                                </label>
                                                                                <input type="range" id="before-like-delay" min="1" max="30" value="8" style={{"width":"100%"}} />
                                                                                <small style={{"color":"#999","fontSize":"9px"}}>Like button</small>
                                                                            </div>
                                                                            <div>
                                                                                <label style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px","fontSize":"10px","color":"#666","fontWeight":600}}>
                                                                                    <span>Before Commenting:</span>
                                                                                    <strong id="before-comment-delay-display" style={{"color":"#693fe9","fontSize":"11px"}}>12s</strong>
                                                                                </label>
                                                                                <input type="range" id="before-comment-delay" min="1" max="30" value="12" style={{"width":"100%"}} />
                                                                                <small style={{"color":"#999","fontSize":"9px"}}>Writing comment</small>
                                                                            </div>
                                                                            <div>
                                                                                <label style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px","fontSize":"10px","color":"#666","fontWeight":600}}>
                                                                                    <span>Before Resharing:</span>
                                                                                    <strong id="before-share-delay-display" style={{"color":"#693fe9","fontSize":"11px"}}>10s</strong>
                                                                                </label>
                                                                                <input type="range" id="before-share-delay" min="1" max="30" value="10" style={{"width":"100%"}} />
                                                                                <small style={{"color":"#999","fontSize":"9px"}}>Reshare button</small>
                                                                            </div>
                                                                            <div>
                                                                                <label style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px","fontSize":"10px","color":"#666","fontWeight":600}}>
                                                                                    <span>Before Following:</span>
                                                                                    <strong id="before-follow-delay-display" style={{"color":"#693fe9","fontSize":"11px"}}>8s</strong>
                                                                                </label>
                                                                                <input type="range" id="before-follow-delay" min="1" max="30" value="8" style={{"width":"100%"}} />
                                                                                <small style={{"color":"#999","fontSize":"9px"}}>Follow button</small>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {/* 7. Human Simulation Card */}
                                                                    <div style={{"background":"white","padding":"12px","borderRadius":"8px","marginBottom":"12px","border":"2px solid #e0e0e0"}}>
                                                                        <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                                                            <span style={{"fontSize":"16px"}}>
                                                                                <IconBot size={14} />
                                                                            </span>
                                                                            <strong style={{"color":"#693fe9","fontSize":"13px"}}>Human Simulation Features</strong>
                                                                        </div>
                                                                        <div style={{"display":"flex","flexDirection":"column","gap":"8px","fontSize":"12px"}}>
                                                                            <label style={{"display":"flex","alignItems":"center","gap":"6px","cursor":"pointer"}}>
                                                                                <input type="checkbox" id="human-mouse-movement" defaultChecked={true} style={{"width":"16px","height":"16px"}} />
                                                                                <span>Mouse Trajectory Humanization (Bezier curves)</span>
                                                                            </label>
                                                                            <label style={{"display":"flex","alignItems":"center","gap":"6px","cursor":"pointer"}}>
                                                                                <input type="checkbox" id="human-scrolling" defaultChecked={true} style={{"width":"16px","height":"16px"}} />
                                                                                <span>In-Tab Simulation (Random scrolling behavior)</span>
                                                                            </label>
                                                                            <label style={{"display":"flex","alignItems":"center","gap":"6px","cursor":"pointer"}}>
                                                                                <input type="checkbox" id="human-reading-pause" defaultChecked={true} style={{"width":"16px","height":"16px"}} />
                                                                                <span>Reading Simulation (Pause and scroll patterns)</span>
                                                                            </label>
                                                                        </div>
                                                                        <small style={{"display":"block","color":"#999","marginTop":"8px","fontSize":"10px"}}>
                                                                            <IconLightbulb size={14} /> Makes automation appear more natural and human-like </small>
                                                                        </div>
                                                                        {/* Save Button (Auto-save) */}
                                                                        <div style={{"background":"#f0f8ff","padding":"10px","borderRadius":"6px","textAlign":"center"}}>
                                                                            <button className="action-button" id="save-limits-settings" style={{"padding":"10px 24px","fontSize":"13px","fontWeight":600,"background":"linear-gradient(135deg, #693fe9 0%, #693fe9 100%)"}}>
                                                                                <IconSave size={14} /> Save All Settings </button>
                                                                                <small style={{"display":"block","marginTop":"6px","color":"#666","fontSize":"10px"}}> Settings auto-save when changed </small>
                                                                            </div>
                                                                        </div>
        </>
    );
}
