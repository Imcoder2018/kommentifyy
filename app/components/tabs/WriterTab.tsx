'use client';
import React from 'react';
import { IconCalendar, IconChart, IconClock, IconEdit, IconLightbulb, IconRocket, IconSave, IconSettings, IconSparkles, IconTarget, IconZap } from './Icons';

export default function WriterTab() {
    return (
        <>
            {/* TAB CONTENT: POST WRITER */} {/* Main 2-Column Layout */}
            <div style={{"display":"grid","gridTemplateColumns":"380px 1fr","gap":"15px","marginBottom":"20px"}}>
                {/* LEFT COLUMN: Controls & Settings */}
                <div style={{"display":"flex","flexDirection":"column","gap":"15px"}}>
                    {/* Post Settings Card */}
                    <div className="card" style={{"background":"linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)"}}>
                        <div style={{"display":"flex","alignItems":"center","gap":"10px","marginBottom":"15px","paddingBottom":"12px","borderBottom":"2px solid #e0e0e0"}}>
                            <span style={{"fontSize":"24px"}}>
                                <IconEdit size={14} />
                            </span>
                            <h4 style={{"margin":0,"color":"#693fe9"}}>Post Settings</h4>
                        </div>
                        <div className="form-group">
                            <label htmlFor="post-topic" style={{"fontWeight":600,"color":"#693fe9","marginBottom":"8px","display":"block"}}>
                                <IconLightbulb size={14} /> Topic/Idea</label>
                                <input type="text" id="post-topic" placeholder="What do you want to write about?" style={{"width":"100%","padding":"10px","border":"2px solid #e0e0e0","borderRadius":"6px","fontSize":"14px"}} />
                                <button className="action-button secondary" id="generate-topic-lines" style={{"marginTop":"8px","width":"100%","padding":"8px","fontSize":"13px"}}>
                                    <IconTarget size={14} /> Generate Topic Lines </button>
                                </div>
                                <div className="form-group" id="topic-lines-container" style={{"display":"block","marginTop":"10px"}}>
                                    <label style={{"fontWeight":600,"color":"#693fe9","marginBottom":"8px","display":"block"}}>
                                        <IconLightbulb size={14} /> Select a Topic Line:</label>
                                        <div id="topic-lines-list" style={{"maxHeight":"150px","overflowY":"auto","border":"2px solid #e0e0e0","borderRadius":"6px","padding":"10px","background":"white"}}>
                                            {/* Topic lines will be dynamically added here */}
                                        </div>
                                    </div>
                                    <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"10px","marginTop":"12px"}}>
                                        <div>
                                            <label htmlFor="post-template" style={{"fontWeight":600,"color":"#693fe9","fontSize":"12px","display":"block","marginBottom":"6px"}}>
                                                <IconZap size={14} /> Template</label>
                                                <select id="post-template" style={{"width":"100%","padding":"8px","border":"2px solid #e0e0e0","borderRadius":"6px","fontSize":"13px"}}>
                                                    <option value="lead_magnet">Lead Magnet</option>
                                                    <option value="thought_leadership">Thought Leadership</option>
                                                    <option value="personal_story">Personal Story</option>
                                                    <option value="advice">Advice/Tips</option>
                                                    <option value="case_study">Case Study</option>
                                                    <option value="controversial">Controversial Opinion</option>
                                                    <option value="question">Question/Poll</option>
                                                    <option value="insight">Industry Insight</option>
                                                    <option value="announcement">Announcement</option>
                                                    <option value="achievement">Achievement</option>
                                                    <option value="tip">Pro Tip</option>
                                                    <option value="story">Story</option>
                                                    <option value="motivation">Motivation</option>
                                                    <option value="how_to">How-To Guide</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="post-tone" style={{"fontWeight":600,"color":"#693fe9","fontSize":"12px","display":"block","marginBottom":"6px"}}>
                                                    <IconZap size={14} /> Tone</label>
                                                    <select id="post-tone" style={{"width":"100%","padding":"8px","border":"2px solid #e0e0e0","borderRadius":"6px","fontSize":"13px"}}>
                                                        <option value="professional">Professional</option>
                                                        <option value="friendly">Friendly</option>
                                                        <option value="inspirational">Inspirational</option>
                                                        <option value="bold">Bold/Provocative</option>
                                                        <option value="educational">Educational</option>
                                                        <option value="conversational">Conversational</option>
                                                        <option value="authoritative">Authoritative</option>
                                                        <option value="humorous">Humorous</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-group" style={{"marginTop":"12px"}}>
                                                <label htmlFor="post-length" style={{"fontWeight":600,"color":"#693fe9","fontSize":"12px","display":"block","marginBottom":"6px"}}>
                                                    <IconZap size={14} /> Post Length</label>
                                                    <select id="post-length" style={{"width":"100%","padding":"8px","border":"2px solid #e0e0e0","borderRadius":"6px","fontSize":"13px"}}>
                                                        <option value="500">Short (500 chars)</option>
                                                        <option value="900">Medium (900 chars)</option>
                                                        <option value="1500">Long (1500 chars)</option>
                                                        <option value="2500">Extra Long (2500 chars)</option>
                                                    </select>
                                                </div>
                                                {/* Advanced Settings (Collapsible) */}
                                                <details style={{"marginTop":"12px","border":"2px solid #e0e0e0","borderRadius":"6px","background":"white"}}>
                                                    <summary style={{"padding":"10px","cursor":"pointer","fontWeight":600,"color":"#693fe9","fontSize":"13px"}}>
                                                        <IconSettings size={14} /> Advanced Settings </summary>
                                                        <div style={{"padding":"12px","borderTop":"1px solid #e0e0e0"}}>
                                                            <div className="form-group" style={{"marginBottom":"10px"}}>
                                                                <label htmlFor="target-audience" style={{"fontSize":"12px","color":"#666","display":"block","marginBottom":"4px"}}> Target Audience</label>
                                                                <input type="text" id="target-audience" placeholder="e.g., Startup founders, Marketing managers" style={{"width":"100%","padding":"8px","border":"1px solid #e0e0e0","borderRadius":"4px","fontSize":"12px"}} />
                                                            </div>
                                                            <div className="form-group" style={{"marginBottom":"10px"}}>
                                                                <label htmlFor="key-message" style={{"fontSize":"12px","color":"#666","display":"block","marginBottom":"4px"}}> Key Message/CTA</label>
                                                                <input type="text" id="key-message" placeholder="e.g., Download my free guide, Book a call" style={{"width":"100%","padding":"8px","border":"1px solid #e0e0e0","borderRadius":"4px","fontSize":"12px"}} />
                                                            </div>
                                                            <div className="form-group">
                                                                <label htmlFor="user-background" style={{"fontSize":"12px","color":"#666","display":"block","marginBottom":"4px"}}> Your Background</label>
                                                                <input type="text" id="user-background" placeholder="e.g., CEO at TechCorp, 10 years in SaaS" style={{"width":"100%","padding":"8px","border":"1px solid #e0e0e0","borderRadius":"4px","fontSize":"12px"}} />
                                                            </div>
                                                        </div>
                                                    </details>
                                                    <div style={{"display":"flex","gap":"15px","marginTop":"15px","padding":"10px","background":"white","borderRadius":"6px","border":"2px solid #e0e0e0"}}>
                                                        <label style={{"display":"flex","alignItems":"center","gap":"6px","cursor":"pointer","fontSize":"13px"}}>
                                                            <input type="checkbox" id="post-include-hashtags" style={{"width":"18px","height":"18px","cursor":"pointer"}} />
                                                            <span style={{"color":"#693fe9","fontWeight":500}}># Hashtags</span>
                                                        </label>
                                                        <label style={{"display":"flex","alignItems":"center","gap":"6px","cursor":"pointer","fontSize":"13px"}}>
                                                            <input type="checkbox" id="post-include-emojis" defaultChecked={true} style={{"width":"18px","height":"18px","cursor":"pointer"}} />
                                                            <span style={{"color":"#693fe9","fontWeight":500}}>
                                                                <IconZap size={14} /> Emojis</span>
                                                            </label>
                                                        </div>
                                                        <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"10px","marginTop":"15px"}}>
                                                            <button className="action-button" id="generate-post" style={{"padding":"12px","fontSize":"14px","fontWeight":600,"background":"linear-gradient(135deg, #693fe9 0%, #693fe9 100%)","boxShadow":"0 4px 10px rgba(54,69,115,0.3)"}}>
                                                                <IconSparkles size={14} /> Generate AI </button>
                                                                <button className="action-button secondary" id="analyze-post" style={{"padding":"12px","fontSize":"14px","fontWeight":600,"border":"2px solid #693fe9","background":"white","color":"#693fe9"}}>
                                                                    <IconChart size={14} /> Analyze </button>
                                                                </div>
                                                            </div>
                                                            {/* Schedule Post Card */}
                                                            <div className="card" style={{"background":"white","border":"2px solid #e0e0e0"}}>
                                                                <div style={{"display":"flex","alignItems":"center","gap":"10px","marginBottom":"12px"}}>
                                                                    <span style={{"fontSize":"20px"}}>
                                                                        <IconClock size={14} />
                                                                    </span>
                                                                    <h4 style={{"margin":0,"color":"#693fe9","fontSize":"15px"}}>Schedule Post</h4>
                                                                </div>
                                                                <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"10px","marginBottom":"10px"}}>
                                                                    <div>
                                                                        <label style={{"fontSize":"11px","color":"#666","display":"block","marginBottom":"4px"}}>
                                                                            <IconCalendar size={14} /> Date</label>
                                                                            <input type="date" id="schedule-date" style={{"width":"100%","padding":"8px","border":"2px solid #e0e0e0","borderRadius":"6px","fontSize":"13px"}} />
                                                                        </div>
                                                                        <div>
                                                                            <label style={{"fontSize":"11px","color":"#666","display":"block","marginBottom":"4px"}}>
                                                                                <IconClock size={14} /> Time</label>
                                                                                <input type="time" id="schedule-time" style={{"width":"100%","padding":"8px","border":"2px solid #e0e0e0","borderRadius":"6px","fontSize":"13px"}} />
                                                                            </div>
                                                                        </div>
                                                                        <button className="action-button" id="schedule-post-btn" style={{"width":"100%","padding":"10px","fontSize":"13px","background":"#693fe9"}}>
                                                                            <IconCalendar size={14} /> Schedule Post </button>
                                                                            <div id="schedule-status" style={{"marginTop":"8px","fontSize":"12px","textAlign":"center"}}>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {/* RIGHT COLUMN: Post Content & Actions */}
                                                                    <div style={{"display":"flex","flexDirection":"column","gap":"15px"}}>
                                                                        {/* Post Editor Card */}
                                                                        <div className="card" style={{"flex":1,"minHeight":"400px","display":"flex","flexDirection":"column"}}>
                                                                            <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"12px","paddingBottom":"12px","borderBottom":"2px solid #e0e0e0"}}>
                                                                                <div style={{"display":"flex","alignItems":"center","gap":"10px"}}>
                                                                                    <span style={{"fontSize":"24px"}}>
                                                                                        <IconEdit size={14} />
                                                                                    </span>
                                                                                    <h4 style={{"margin":0,"color":"#693fe9"}}>Post Content</h4>
                                                                                </div>
                                                                                <div style={{"fontSize":"11px","color":"#999"}} id="char-count">0 / 3,000 characters</div>
                                                                            </div>
                                                                            <textarea id="post-content" placeholder="Your AI-generated post will appear here... or start writing your own!" style={{"flex":1,"minHeight":"350px","width":"100%","padding":"15px","border":"2px solid #e0e0e0","borderRadius":"8px","fontSize":"14px","lineHeight":"1.6","resize":"vertical","fontFamily":"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"}}>
                                                                            </textarea>
                                                                            {/* Action Buttons */}
                                                                            <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"12px","marginTop":"15px"}}>
                                                                                <button className="action-button" id="post-to-linkedin" style={{"padding":"14px","fontSize":"15px","fontWeight":600,"background":"#693fe9","boxShadow":"0 4px 12px rgba(105,63,233,0.3)"}}>
                                                                                    <IconRocket size={14} /> Post to LinkedIn </button>
                                                                                    <button className="action-button secondary" id="save-draft" style={{"padding":"14px","fontSize":"15px","fontWeight":600,"border":"2px solid #693fe9","background":"white","color":"#693fe9"}}>
                                                                                        <IconSave size={14} /> Save Draft </button>
                                                                                    </div>
                                                                                </div>
                                                                                {/* Post Analysis Card */}
                                                                                <div className="card" id="post-analysis" style={{"display":"block","background":"linear-gradient(135deg, #f8f9fa 0%, #e8eef5 100%)","border":"2px solid #693fe9"}}>
                                                                                    <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"12px"}}>
                                                                                        <span style={{"fontSize":"20px"}}>
                                                                                            <IconChart size={14} />
                                                                                        </span>
                                                                                        <h4 style={{"margin":0,"color":"#693fe9","fontSize":"14px"}}>Post Analysis</h4>
                                                                                    </div>
                                                                                    <div style={{"display":"grid","gridTemplateColumns":"100px 1fr","gap":"12px","alignItems":"start"}}>
                                                                                        <div style={{"textAlign":"center","background":"white","padding":"12px","borderRadius":"8px","boxShadow":"0 2px 6px rgba(0,0,0,0.08)"}}>
                                                                                            <div style={{"fontSize":"36px","fontWeight":"bold","color":"#693fe9","lineHeight":1}} id="engagement-score">0</div>
                                                                                            <div style={{"fontSize":"10px","color":"#666","marginTop":"4px","fontWeight":600}}>SCORE</div>
                                                                                        </div>
                                                                                        <div style={{"background":"white","padding":"12px","borderRadius":"8px","boxShadow":"0 2px 4px rgba(0,0,0,0.05)","overflow":"hidden"}}>
                                                                                            <strong style={{"display":"block","marginBottom":"8px","color":"#693fe9","fontSize":"12px"}}>
                                                                                                <IconLightbulb size={14} /> Recommendations:</strong>
                                                                                                <div id="post-recommendations" style={{"fontSize":"11px","color":"#444","lineHeight":"1.4","maxHeight":"80px","overflowY":"auto"}}>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            {/* Bottom Section: Tabs for Drafts & Calendar */}
                                                                            <div className="card" style={{"background":"white"}}>
                                                                                <div style={{"display":"flex","borderBottom":"2px solid #e0e0e0","marginBottom":"15px"}}>
                                                                                    <button className="tab-btn active" data-tab="drafts" style={{"flex":1,"padding":"12px","border":"none","background":"none","fontSize":"14px","fontWeight":600,"color":"#999","cursor":"pointer","borderBottom":"3px solid transparent","transition":"all 0.3s"}}>
                                                                                        <IconSave size={14} /> Saved Drafts (<span id="draft-count">0</span>) </button>
                                                                                        <button className="tab-btn" data-tab="calendar" style={{"flex":1,"padding":"12px","border":"none","background":"none","fontSize":"14px","fontWeight":600,"color":"#999","cursor":"pointer","borderBottom":"3px solid transparent","transition":"all 0.3s"}}>
                                                                                            <IconCalendar size={14} /> Content Calendar </button>
                                                                                        </div>
                                                                                        {/* Drafts Tab Content */}
                                                                                        <div id="drafts-tab-content" className="bottom-tab-content">
                                                                                            <div id="drafts-list" style={{"maxHeight":"300px","overflowY":"auto"}}>
                                                                                                <p className="empty-state" style={{"textAlign":"center","color":"#999","padding":"40px","fontSize":"14px"}}> No saved drafts yet. Save your posts to access them later! </p>
                                                                                            </div>
                                                                                        </div>
                                                                                        {/* Calendar Tab Content */}
                                                                                        <div id="calendar-tab-content" className="bottom-tab-content" style={{"display":"block"}}>
                                                                                            <div id="upcoming-posts" style={{"maxHeight":"300px","overflowY":"auto"}}>
                                                                                                <p style={{"textAlign":"center","color":"#999","padding":"40px","fontSize":"14px"}}> No scheduled posts. Schedule a post to see it here! </p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
        </>
    );
}
