'use client';
import React from 'react';
import { IconBot, IconBriefcase, IconChart, IconClock, IconLightbulb, IconList, IconMessage, IconPause, IconPlus, IconRefresh, IconRocket, IconSave, IconSearch, IconSettings, IconShare, IconStop, IconTarget, IconThumbsUp, IconTrash, IconZap } from './Icons';

export default function AutomationTab() {
    return (
        <>
            {/* TAB CONTENT: COMMENTER */} {/* Live Status Log Bar */}
            <div id="automation-status-bar" style={{"background":"linear-gradient(135deg, #693fe9 0%, #693fe9 100%)","color":"white","padding":"10px 15px","borderRadius":"10px","marginBottom":"12px","fontSize":"12px","display":"block","alignItems":"center","gap":"10px","boxShadow":"0 2px 8px rgba(54, 69, 115, 0.3)"}}>
                <div style={{"display":"flex","alignItems":"center","gap":"8px","flex":1}}>
                    <span id="automation-status-icon" style={{"fontSize":"16px"}}>
                        <IconRefresh size={14} />
                    </span>
                    <span id="automation-status-text" style={{"fontWeight":500}}>Ready</span>
                </div>
                <div id="automation-status-timer" style={{"fontSize":"11px","opacity":"0.8","fontFamily":"monospace"}}>
                </div>
            </div>
            <div className="card" style={{"background":"linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)"}}>
                {/* Header */}
                <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"15px","paddingBottom":"12px","borderBottom":"2px solid #e0e0e0"}}>
                    <div>
                        <h4 style={{"margin":"0 0 4px 0"}}>
                            <IconMessage size={14} /> Commenter</h4>
                            <small style={{"color":"#666"}}>AI-powered bulk commenting and engagement</small>
                        </div>
                        <div style={{"display":"flex","alignItems":"center","gap":"6px","fontSize":"11px","color":"#666"}}>
                            <span>
                                <IconClock size={14} /> Auto-Schedule</span>
                                <label className="switch" style={{"transform":"scale(0.7)"}}>
                                    <input type="checkbox" id="bulk-scheduler-enabled" defaultChecked={true} />
                                    <span className="slider">
                                    </span>
                                </label>
                            </div>
                        </div>
                        {/* Scheduled Times Section - Compact */}
                        <div style={{"background":"#f0f8ff","padding":"8px","borderRadius":"6px","marginBottom":"12px","fontSize":"11px"}}>
                            <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"6px"}}>
                                <small style={{"color":"#693fe9","fontWeight":600}}>
                                    <IconClock size={14} /> Schedules</small>
                                    <div style={{"display":"flex","gap":"10px","fontSize":"10px","color":"#666"}}>
                                        <span>Next: <strong id="bulk-next-execution-time">--</strong>
                                    </span>
                                    <span>
                                        <strong id="bulk-countdown-timer">--:--:--</strong>
                                    </span>
                                </div>
                            </div>
                            <div id="bulk-schedule-list" style={{"maxHeight":"100px","overflowY":"auto","paddingRight":"4px"}}>
                                <small style={{"color":"#999"}}>No schedules</small>
                            </div>
                        </div>
                        {/* Post Source Selection */}
                        <div style={{"background":"white","padding":"12px","borderRadius":"8px","marginBottom":"12px","border":"2px solid #e0e0e0"}}>
                            <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                <span style={{"fontSize":"16px"}}>
                                    <IconSearch size={14} />
                                </span>
                                <strong style={{"color":"#693fe9","fontSize":"13px"}}>Post Source</strong>
                            </div>
                            <div style={{"display":"flex","gap":"8px","marginBottom":"10px"}}>
                                <label style={{"flex":1,"display":"flex","alignItems":"center","gap":"6px","padding":"8px 12px","background":"#f8f9fa","border":"2px solid #e0e0e0","borderRadius":"6px","cursor":"pointer"}} id="source-keywords-label">
                                    <input type="radio" name="post-source" id="source-keywords" value="keywords" style={{"accentColor":"#693fe9"}} />
                                    <span style={{"fontSize":"12px","fontWeight":600,"color":"#666"}}>
                                        <IconSearch size={14} /> Search Keywords</span>
                                    </label>
                                    <label style={{"flex":1,"display":"flex","alignItems":"center","gap":"6px","padding":"8px 12px","background":"#f0f8ff","border":"2px solid #693fe9","borderRadius":"6px","cursor":"pointer"}} id="source-feed-label">
                                        <input type="radio" name="post-source" id="source-feed" value="feed" defaultChecked={true} style={{"accentColor":"#693fe9"}} />
                                        <span style={{"fontSize":"12px","fontWeight":600,"color":"#693fe9"}}>
                                            <IconList size={14} /> LinkedIn Feed</span>
                                        </label>
                                    </div>
                                    <small style={{"display":"block","color":"#999","fontSize":"10px"}}>
                                        <IconLightbulb size={14} /> Feed mode processes posts from your home feed and automatically ignores ads/promoted posts </small>
                                    </div>
                                    {/* AI Keyword Generation (Compact 2-Column) - Hidden by default since Feed is default */}
                                    <div id="keyword-section" style={{"background":"white","padding":"12px","borderRadius":"8px","marginBottom":"12px","border":"2px solid #e0e0e0","display":"block"}}>
                                        <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                            <span style={{"fontSize":"16px"}}>
                                                <IconBot size={14} />
                                            </span>
                                            <strong style={{"color":"#693fe9","fontSize":"13px"}}>AI Keyword Generation</strong>
                                        </div>
                                        <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"10px","marginBottom":"10px"}}>
                                            <div>
                                                <label htmlFor="keyword-intent" style={{"display":"block","marginBottom":"4px","fontSize":"11px","color":"#666","fontWeight":600}}>Target Audience:</label>
                                                <textarea id="keyword-intent" rows={3} placeholder="e.g., tech entrepreneurs interested in AI & ML" style={{"width":"100%","padding":"8px","fontSize":"12px","border":"2px solid #e0e0e0","borderRadius":"6px","resize":"vertical"}}>
                                                </textarea>
                                            </div>
                                            <div>
                                                <label htmlFor="bulk-urls" style={{"display":"block","marginBottom":"4px","fontSize":"11px","color":"#666","fontWeight":600}}>Keywords (one per line):</label>
                                                <textarea id="bulk-urls" rows={3} placeholder="AI&#10;machine learning&#10;web development" style={{"width":"100%","padding":"8px","fontSize":"12px","border":"2px solid #e0e0e0","borderRadius":"6px"}}>
                                                </textarea>
                                            </div>
                                        </div>
                                        <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                            <label style={{"display":"flex","alignItems":"center","gap":"6px","fontSize":"11px","whiteSpace":"nowrap"}}> Count: <input type="range" id="keyword-count-slider" min="1" max="10" value="5" style={{"width":"60px"}} />
                                            <strong id="keyword-count-display" style={{"color":"#693fe9","minWidth":"15px"}}>5</strong>
                                        </label>
                                        <button type="button" id="generate-keywords" className="action-button" style={{"padding":"6px 10px","fontSize":"11px","background":"#693fe9","whiteSpace":"nowrap"}}>
                                            <IconBot size={14} /> Generate Keywords</button>
                                            <button type="button" id="clear-keywords" className="action-button secondary" style={{"padding":"6px 8px","fontSize":"11px","border":"2px solid #dc3545","background":"white","color":"#dc3545","whiteSpace":"nowrap"}}>
                                                <IconTrash size={14} /> Clear</button>
                                            </div>
                                        </div>
                                        {/* Schedule & Start Controls (Always Visible) */}
                                        <div style={{"background":"white","padding":"12px","borderRadius":"8px","marginBottom":"12px","border":"2px solid #e0e0e0"}}>
                                            <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                                <input type="time" id="bulk-schedule-time-input" style={{"padding":"6px 8px","fontSize":"11px","width":"100px","border":"2px solid #e0e0e0","borderRadius":"4px"}} />
                                                <button type="button" id="add-bulk-schedule" className="action-button" style={{"padding":"6px 10px","fontSize":"11px","background":"#693fe9","whiteSpace":"nowrap"}}>
                                                    <IconPlus size={14} /> Add Schedule</button>
                                                    <span style={{"flex":1}}>
                                                    </span>
                                                    <small style={{"color":"#666","fontSize":"10px"}}>
                                                        <IconClock size={14} /> Schedule will use current settings</small>
                                                    </div>
                                                    <button className="start-button" id="start-bulk-processing" style={{"width":"100%","padding":"10px","fontSize":"13px","fontWeight":600,"background":"linear-gradient(135deg, #693fe9 0%, #693fe9 100%)","marginBottom":0}}>
                                                        <IconRocket size={14} />  Start Bulk Commenting </button>
                                                        <button className="start-button secondary" id="stop-bulk-processing" style={{"display":"block","width":"100%","padding":"10px","fontSize":"13px","fontWeight":600,"background":"#dc3545","marginTop":0}}>
                                                            <IconStop size={14} /> Stop Processing </button>
                                                        </div>
                                                        {/* 2-Column Layout: Actions (Left) + Settings (Right) */}
                                                        <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"12px","marginBottom":"12px"}}>
                                                            {/* Left Column: Actions Checkboxes */}
                                                            <div style={{"background":"white","padding":"12px","borderRadius":"8px","border":"2px solid #e0e0e0"}}>
                                                                <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                                                    <span style={{"fontSize":"16px"}}>
                                                                        <IconZap size={14} />
                                                                    </span>
                                                                    <strong style={{"color":"#693fe9","fontSize":"13px"}}>Actions to Perform</strong>
                                                                </div>
                                                                <div style={{"display":"flex","flexDirection":"column","gap":"8px","fontSize":"12px"}}>
                                                                    <label style={{"display":"flex","alignItems":"center","gap":"6px","cursor":"pointer","background":"linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.05) 100%)","padding":"6px 8px","borderRadius":"6px","border":"1px solid rgba(16,185,129,0.3)"}}>
                                                                        <input type="checkbox" id="bulk-save-posts" defaultChecked={true} style={{"width":"16px","height":"16px"}} />
                                                                        <span style={{"color":"#10b981","fontWeight":600}}>
                                                                            <IconSave size={14} /> Save Posts</span>
                                                                    </label>
                                                                    <label style={{"display":"flex","alignItems":"center","gap":"6px","cursor":"pointer"}}>
                                                                        <input type="checkbox" id="bulk-like" style={{"width":"16px","height":"16px"}} />
                                                                        <span>
                                                                            <IconThumbsUp size={14} /> Like Posts</span>
                                                                        </label>
                                                                        <label style={{"display":"flex","alignItems":"center","gap":"6px","cursor":"pointer"}}>
                                                                            <input type="checkbox" id="bulk-comment" defaultChecked={true} style={{"width":"16px","height":"16px"}} />
                                                                            <span>
                                                                                <IconMessage size={14} /> Comment on Posts</span>
                                                                            </label>
                                                                            <label style={{"display":"flex","alignItems":"center","gap":"6px","cursor":"pointer"}}>
                                                                                <input type="checkbox" id="bulk-like-or-comment" style={{"width":"16px","height":"16px"}} />
                                                                                <span>
                                                                                    <IconZap size={14} /> Like OR Comment</span>
                                                                                </label>
                                                                                <label style={{"display":"flex","alignItems":"center","gap":"6px","cursor":"pointer"}}>
                                                                                    <input type="checkbox" id="bulk-share" style={{"width":"16px","height":"16px"}} />
                                                                                    <span>
                                                                                        <IconShare size={14} /> Share Posts</span>
                                                                                    </label>
                                                                                    <label style={{"display":"flex","alignItems":"center","gap":"6px","cursor":"pointer"}}>
                                                                                        <input type="checkbox" id="bulk-follow" style={{"width":"16px","height":"16px"}} />
                                                                                        <span>� Follow Authors</span>
                                                                                    </label>
                                                                                </div>
                                                                                <small style={{"display":"block","color":"#999","marginTop":"8px","fontSize":"10px"}}>
                                                                                    <IconLightbulb size={14} /> "Like OR Comment" randomly chooses one action per post </small>
                                                                                </div>
                                                                                {/* Right Column: Processing Settings + Post Qualification */}
                                                                                <div style={{"display":"flex","flexDirection":"column","gap":"12px"}}>
                                                                                    {/* Processing Settings */}
                                                                                    <div style={{"background":"white","padding":"12px","borderRadius":"8px","border":"2px solid #e0e0e0"}}>
                                                                                        <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                                                                            <span style={{"fontSize":"16px"}}>
                                                                                                <IconSettings size={14} />
                                                                                            </span>
                                                                                            <strong style={{"color":"#693fe9","fontSize":"13px"}}>Processing Settings</strong>
                                                                                        </div>
                                                                                        <div style={{"marginBottom":0}}>
                                                                                            <label style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"4px","fontSize":"11px"}}>
                                                                                                <span>Total Posts:</span>
                                                                                                <strong id="bulk-quota-display" style={{"color":"#693fe9"}}>3</strong>
                                                                                            </label>
                                                                                            <input type="range" id="bulk-quota" min="1" max="100" value="3" style={{"width":"100%"}} />
                                                                                            <small style={{"display":"block","marginTop":"2px","color":"#999","fontSize":"10px"}}>Scrapes posts until quota reached</small>
                                                                                        </div>
                                                                                    </div>
                                                                                    {/* Post Qualification */}
                                                                                    <div style={{"background":"white","padding":"12px","borderRadius":"8px","border":"2px solid #e0e0e0"}}>
                                                                                        <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                                                                            <span style={{"fontSize":"16px"}}>
                                                                                                <IconChart size={14} />
                                                                                            </span>
                                                                                            <strong style={{"color":"#693fe9","fontSize":"13px"}}>Post Qualification</strong>
                                                                                        </div>
                                                                                        <div style={{"marginBottom":"6px"}}>
                                                                                            <label style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"3px","fontSize":"11px"}}>
                                                                                                <span>Min Likes:</span>
                                                                                                <strong id="bulk-min-likes-display" style={{"color":"#693fe9"}}>0</strong>
                                                                                            </label>
                                                                                            <input type="range" id="bulk-min-likes" min="0" max="100" value="0" step="1" style={{"width":"100%"}} />
                                                                                        </div>
                                                                                        <div style={{"marginBottom":"2px"}}>
                                                                                            <label style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"3px","fontSize":"11px"}}>
                                                                                                <span>Min Comments:</span>
                                                                                                <strong id="bulk-min-comments-display" style={{"color":"#693fe9"}}>0</strong>
                                                                                            </label>
                                                                                            <input type="range" id="bulk-min-comments" min="0" max="100" value="0" step="1" style={{"width":"100%"}} />
                                                                                        </div>
                                                                                        <small style={{"display":"block","color":"#999","fontSize":"10px"}}>0 = no minimum</small>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            {/* Ignore Keywords Section */}
                                                                            <div style={{"background":"white","padding":"12px","borderRadius":"8px","marginBottom":"12px","border":"2px solid #e0e0e0"}}>
                                                                                <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                                                                    <span style={{"fontSize":"16px"}}>
                                                                                        <IconZap size={14} />
                                                                                    </span>
                                                                                    <strong style={{"color":"#dc3545","fontSize":"13px"}}> Ignore Posts Containing</strong>
                                                                                </div>
                                                                                <textarea id="ignore-keywords" rows={2} placeholder="we're hiring&#10;now hiring&#10;apply now" style={{"width":"100%","padding":"8px","fontSize":"12px","border":"2px solid #e0e0e0","borderRadius":"6px","resize":"vertical"}} >
                                                                                </textarea>
                                                                                <small style={{"display":"block","color":"#999","marginTop":"6px","fontSize":"10px"}}>
                                                                                    <IconLightbulb size={14} /> One keyword per line. Posts containing any of these will be skipped (case-insensitive). </small>
                                                                                </div>
                                                                                {/* Business Hours moved to Settings tab */}
                                                                                <div style={{"background":"#f0f8ff","padding":"10px","borderRadius":"6px","marginBottom":"12px","borderLeft":"4px solid #693fe9"}}>
                                                                                    <small style={{"color":"#693fe9","fontSize":"11px"}}>
                                                                                        <strong>
                                                                                            <IconSettings size={14} /> Business Hours:</strong> Configure business hours and active days in the <strong>Settings</strong> tab. </small>
                                                                                        </div>
                                                                                    </div>
                                                                                    {/* AI Comment Settings (2-Column) */}
                                                                                    <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"12px","marginBottom":"12px"}}>
                                                                                        {/* Comment Goal */}
                                                                                        <div className="card" style={{"padding":"12px"}}>
                                                                                            <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                                                                                <span style={{"fontSize":"16px"}}>
                                                                                                    <IconTarget size={14} />
                                                                                                </span>
                                                                                                <strong style={{"color":"#693fe9","fontSize":"13px"}}>Comment Goal</strong>
                                                                                            </div>
                                                                                            <select id="comment-goal" style={{"width":"100%","padding":"8px","fontSize":"12px","border":"2px solid #e0e0e0","borderRadius":"6px"}}>
                                                                                                <option value="AddValue">Add Value - Pure contribution, helpful insight</option>
                                                                                                <option value="ShareExperience">Share Experience - Personal story/perspective</option>
                                                                                                <option value="AskQuestion">Ask Question - Deepen discussion</option>
                                                                                                <option value="DifferentPerspective">Different Perspective - Add nuance</option>
                                                                                                <option value="BuildRelationship">Build Relationship - Warm, supportive</option>
                                                                                                <option value="SubtlePitch">Subtle Pitch - Strategic positioning</option>
                                                                                            </select>
                                                                                            <small style={{"display":"block","color":"#999","marginTop":"6px","fontSize":"10px"}}> What you want to achieve with this comment </small>
                                                                                        </div>
                                                                                        {/* Tone of Voice */}
                                                                                        <div className="card" style={{"padding":"12px"}}>
                                                                                            <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                                                                                <span style={{"fontSize":"16px"}}>
                                                                                                    <IconZap size={14} />
                                                                                                </span>
                                                                                                <strong style={{"color":"#693fe9","fontSize":"13px"}}>Tone of Voice</strong>
                                                                                            </div>
                                                                                            <select id="comment-tone" style={{"width":"100%","padding":"8px","fontSize":"12px","border":"2px solid #e0e0e0","borderRadius":"6px"}}>
                                                                                                <option value="Professional">Professional - Polished, business-appropriate</option>
                                                                                                <option value="Friendly">Friendly - Warm, conversational</option>
                                                                                                <option value="ThoughtProvoking">Thought-Provoking - Intellectual, deep</option>
                                                                                                <option value="Supportive">Supportive - Encouraging, positive</option>
                                                                                                <option value="Contrarian">Contrarian - Respectfully challenges</option>
                                                                                                <option value="Humorous">Humorous - Light, witty, entertaining</option>
                                                                                            </select>
                                                                                            <small style={{"display":"block","color":"#999","marginTop":"6px","fontSize":"10px"}}> Controls AI comment personality and style </small>
                                                                                        </div>
                                                                                        {/* Comment Length */}
                                                                                        <div className="card" style={{"padding":"12px"}}>
                                                                                            <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                                                                                <span style={{"fontSize":"16px"}}>
                                                                                                    <IconZap size={14} />
                                                                                                </span>
                                                                                                <strong style={{"color":"#693fe9","fontSize":"13px"}}>Comment Length</strong>
                                                                                            </div>
                                                                                            <select id="comment-length" style={{"width":"100%","padding":"8px","fontSize":"12px","border":"2px solid #e0e0e0","borderRadius":"6px"}}>
                                                                                                <option value="Short">Short - 300 characters max</option>
                                                                                                <option value="Mid">Mid - 600 characters max</option>
                                                                                                <option value="Long">Long - 900 characters max</option>
                                                                                            </select>
                                                                                            <small style={{"display":"block","color":"#999","marginTop":"6px","fontSize":"10px"}}> Maximum length of generated comments </small>
                                                                                        </div>
                                                                                        {/* User Expertise */}
                                                                                        <div className="card" style={{"padding":"12px"}}>
                                                                                            <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                                                                                <span style={{"fontSize":"16px"}}>
                                                                                                    <IconBriefcase size={14} />
                                                                                                </span>
                                                                                                <strong style={{"color":"#693fe9","fontSize":"13px"}}>Your Expertise/Niche</strong>
                                                                                            </div>
                                                                                            <input type="text" id="user-expertise" placeholder="e.g., SaaS Marketing, AI Development, Leadership Coach" style={{"width":"100%","padding":"8px","fontSize":"12px","border":"2px solid #e0e0e0","borderRadius":"6px"}} />
                                                                                            <small style={{"display":"block","color":"#999","marginTop":"6px","fontSize":"10px"}}> Your role, industry, or what you're known for </small>
                                                                                        </div>
                                                                                        {/* User Background */}
                                                                                        <div className="card" style={{"padding":"12px"}}>
                                                                                            <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                                                                                <span style={{"fontSize":"16px"}}>
                                                                                                    <IconZap size={14} />
                                                                                                </span>
                                                                                                <strong style={{"color":"#693fe9","fontSize":"13px"}}>Your Background/Experience (Optional)</strong>
                                                                                            </div>
                                                                                            <textarea id="user-background" rows={3} placeholder="e.g., Scaled 3 startups to $10M ARR, 15 years in B2B sales, Former VP at Google" style={{"width":"100%","padding":"8px","fontSize":"12px","border":"2px solid #e0e0e0","borderRadius":"6px","resize":"vertical"}} >
                                                                                            </textarea>
                                                                                            <small style={{"display":"block","color":"#999","marginTop":"6px","fontSize":"10px"}}> Specific experience, credentials, or results that add authority </small>
                                                                                        </div>
                                                                                        {/* Auto-Post Setting */}
                                                                                        <div className="card" style={{"padding":"12px"}}>
                                                                                            <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                                                                                <span style={{"fontSize":"16px"}}>
                                                                                                    <IconRocket size={14} />
                                                                                                </span>
                                                                                                <strong style={{"color":"#693fe9","fontSize":"13px"}}>AI Button Behavior</strong>
                                                                                            </div>
                                                                                            <select id="ai-auto-post" style={{"width":"100%","padding":"8px","fontSize":"12px","border":"2px solid #e0e0e0","borderRadius":"6px"}}>
                                                                                                <option value="auto">Auto-Post - Generate and submit automatically</option>
                                                                                                <option value="manual">Manual Review - Generate, paste, and wait for me to post</option>
                                                                                            </select>
                                                                                            <small style={{"display":"block","color":"#999","marginTop":"6px","fontSize":"10px"}}> Controls what happens when you click <IconBot size={14} /> AI button on posts </small>
                                                                                        </div>
                                                                                    </div>
                                                                                    {/* Window Preferences (Compact) */}
                                                                                    <div className="card" style={{"padding":"12px"}}>
                                                                                        <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between"}}>
                                                                                            <div>
                                                                                                <strong style={{"fontSize":"13px","color":"#693fe9"}}> Window & Tab Preferences</strong>
                                                                                                <small style={{"display":"block","color":"#666","marginTop":"2px","fontSize":"10px"}}> Open search pages in new window or background tabs </small>
                                                                                            </div>
                                                                                            <label style={{"display":"flex","alignItems":"center","gap":"8px","fontSize":"12px","cursor":"pointer"}}>
                                                                                                <input type="checkbox" id="open-search-in-window" defaultChecked={true} style={{"width":"18px","height":"18px"}} />
                                                                                                <span>New Window</span>
                                                                                            </label>
                                                                                        </div>
                                                                                    </div>
                                                                                    {/* Start Button Copy */}
                                                                                    <div style={{"marginBottom":"12px"}}>
                                                                                        <button className="start-button" id="start-bulk-processing-bottom" style={{"width":"100%","padding":"12px","fontSize":"14px","fontWeight":600,"background":"linear-gradient(135deg, #693fe9 0%, #693fe9 100%)"}}>
                                                                                            <IconRocket size={14} /> ▼ Start Bulk Commenting </button>
                                                                                            <button className="start-button secondary" id="stop-bulk-processing-bottom" style={{"display":"block","width":"100%","padding":"12px","fontSize":"14px","fontWeight":600,"background":"#dc3545","marginTop":"8px"}}>
                                                                                                <IconPause size={14} /> Stop Processing </button>
                                                                                            </div>
                                                                                            {/* Info Card */}
                                                                                            <div className="card" style={{"padding":"10px","background":"#f0f8ff","border":"1px solid #d0e8ff"}}>
                                                                                                <small style={{"color":"#0066cc","display":"flex","alignItems":"center","gap":"6px"}}>
                                                                                                    <span style={{"fontSize":"16px"}}>
                                                                                                        <IconLightbulb size={14} />
                                                                                                    </span>
                                                                                                    <span>Delay settings and daily limits are in the <strong>Limits</strong> tab</span>
                                                                                                </small>
                                                                                            </div>
        </>
    );
}
