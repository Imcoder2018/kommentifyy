'use client';
import React from 'react';
import { IconBot, IconCalendar, IconChart, IconCheck, IconClock, IconDownload, IconEdit, IconFileText, IconGlobe, IconHourglass, IconLightbulb, IconMapPin, IconMessage, IconPlus, IconRefresh, IconRocket, IconShare, IconSparkles, IconStop, IconThumbsUp, IconUser, IconUserPlus, IconUsers, IconX, IconZap } from './Icons';

export default function DashboardTab() {
    return (
        <>
            {/* TAB CONTENT: DASHBOARD */} {/* Progress Bar */}
            <div id="progress-container" className="card" style={{"display":"block","marginBottom":"15px"}}>
                <h4>
                    <IconRocket size={14} /> Bulk Processing Progress</h4>
                    <div className="progress-info" style={{"display":"flex","justifyContent":"space-between","marginBottom":"8px","fontSize":"12px"}}>
                        <span id="progress-text">Processing keywords...</span>
                        <span id="progress-stats">0/0 posts</span>
                    </div>
                    <div className="progress-bar-container" style={{"width":"100%","height":"20px","backgroundColor":"#f0f2f5","borderRadius":"10px","overflow":"hidden"}}>
                        <div id="progress-bar" style={{"height":"100%","background":"#693fe9","width":"0%","transition":"width 0.3s ease"}}>
                        </div>
                    </div>
                    <div className="progress-details" style={{"marginTop":"8px","fontSize":"11px","color":"#666"}}>
                        <div style={{"display":"flex","justifyContent":"space-between"}}>
                            <span>Keywords: <span id="progress-keywords">0/0</span>
                        </span>
                        <span>Actions: <span id="progress-actions">0 completed</span>
                    </span>
                </div>
            </div>
        </div>
        {/* Today's Local Activity (Simple Boxes) */}
        <div className="card" style={{"marginBottom":"15px"}}>
            <h4>
                <IconChart size={14} /> Today's Activity & Live Progress</h4>
                {/* Local Activity Boxes (Redesigned) */}
                <div style={{"display":"grid","gridTemplateColumns":"repeat(5, 1fr)","gap":"10px","marginBottom":"15px"}}>
                    <div style={{"background":"linear-gradient(135deg, #693fe9 0%, #7c4dff 100%)","padding":"14px 8px","borderRadius":"12px","textAlign":"center","boxShadow":"0 4px 12px rgba(105, 63, 233, 0.3)"}}>
                        <div style={{"fontSize":"18px","fontWeight":700,"color":"white","marginBottom":"2px"}}>
                            <span id="local-comments">0</span>
                            <span style={{"fontSize":"12px","opacity":"0.8"}}>/<span id="daily-comments-limit">30</span>
                        </span>
                    </div>
                    <div style={{"fontSize":"9px","color":"rgba(255, 255, 255, 0.95)","textTransform":"uppercase","fontWeight":600,"letterSpacing":"0.5px"}}>Comments</div>
                </div>
                <div style={{"background":"linear-gradient(135deg, #EC4899 0%, #DB2777 100%)","padding":"14px 8px","borderRadius":"12px","textAlign":"center","boxShadow":"0 4px 12px rgba(236, 72, 153, 0.3)"}}>
                    <div style={{"fontSize":"18px","fontWeight":700,"color":"white","marginBottom":"2px"}}>
                        <span id="local-likes">0</span>
                        <span style={{"fontSize":"12px","opacity":"0.8"}}>/<span id="daily-likes-limit">60</span>
                    </span>
                </div>
                <div style={{"fontSize":"9px","color":"rgba(255, 255, 255, 0.95)","textTransform":"uppercase","fontWeight":600,"letterSpacing":"0.5px"}}>Likes</div>
            </div>
            <div style={{"background":"linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)","padding":"14px 8px","borderRadius":"12px","textAlign":"center","boxShadow":"0 4px 12px rgba(6, 182, 212, 0.3)"}}>
                <div style={{"fontSize":"18px","fontWeight":700,"color":"white","marginBottom":"2px"}}>
                    <span id="local-shares">0</span>
                    <span style={{"fontSize":"12px","opacity":"0.8"}}>/<span id="daily-shares-limit">15</span>
                </span>
            </div>
            <div style={{"fontSize":"9px","color":"rgba(255, 255, 255, 0.95)","textTransform":"uppercase","fontWeight":600,"letterSpacing":"0.5px"}}>Shares</div>
        </div>
        <div style={{"background":"linear-gradient(135deg, #693fe9 0%, #5835c7 100%)","padding":"14px 8px","borderRadius":"12px","textAlign":"center","boxShadow":"0 4px 12px rgba(105, 63, 233, 0.3)"}}>
            <div style={{"fontSize":"18px","fontWeight":700,"color":"white","marginBottom":"2px"}}>
                <span id="local-follows">0</span>
                <span style={{"fontSize":"12px","opacity":"0.8"}}>/<span id="daily-follows-limit">30</span>
            </span>
        </div>
        <div style={{"fontSize":"9px","color":"rgba(255, 255, 255, 0.95)","textTransform":"uppercase","fontWeight":600,"letterSpacing":"0.5px"}}>Follows</div>
    </div>
    <div style={{"background":"linear-gradient(135deg, #F59E0B 0%, #D97706 100%)","padding":"14px 8px","borderRadius":"12px","textAlign":"center","boxShadow":"0 4px 12px rgba(245, 158, 11, 0.3)"}}>
        <div style={{"fontSize":"18px","fontWeight":700,"color":"white","marginBottom":"2px"}}>
            <span id="local-connections">0</span>
            <span style={{"fontSize":"12px","opacity":"0.8"}}>/<span id="daily-connections-limit">50</span>
        </span>
    </div>
    <div style={{"fontSize":"9px","color":"rgba(255, 255, 255, 0.95)","textTransform":"uppercase","fontWeight":600,"letterSpacing":"0.5px"}}>Connections</div>
</div>
</div>
{/* Active Workings Section (Shows all active automations) */}
<div id="active-workings-section" style={{"display":"block","paddingTop":"15px","borderTop":"1px solid #e0e0e0","marginTop":"15px"}}>
    <strong style={{"fontSize":"13px","display":"block","marginBottom":"10px"}}>
        <IconZap size={14} /> Active Workings:</strong>
        {/* Commenter Active */}
        <div id="active-commenter" style={{"display":"block","background":"linear-gradient(135deg, #f0f8ff 0%, #e6f0ff 100%)","padding":"10px 12px","borderRadius":"8px","marginBottom":"8px","borderLeft":"4px solid #693fe9"}}>
            <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between"}}>
                <div style={{"display":"flex","alignItems":"center","gap":"8px"}}>
                    <IconMessage size={14} />
                    <div>
                        <div style={{"fontWeight":600,"fontSize":"12px","color":"#693fe9"}}>Bulk Commenting</div>
                        <div id="active-commenter-status" style={{"fontSize":"10px","color":"#666"}}>Processing...</div>
                    </div>
                </div>
                <button id="stop-commenter-dashboard" style={{"background":"#dc3545","color":"white","border":"none","padding":"5px 10px","borderRadius":"4px","fontSize":"10px","cursor":"pointer","fontWeight":600}}>
                    <IconStop size={14} /> Stop </button>
                </div>
            </div>
            {/* Networking Active */}
            <div id="active-networking" style={{"display":"block","background":"linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%)","padding":"10px 12px","borderRadius":"8px","marginBottom":"8px","borderLeft":"4px solid #f59e0b"}}>
                <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between"}}>
                    <div style={{"display":"flex","alignItems":"center","gap":"8px"}}>
                        <IconUsers size={14} />
                        <div>
                            <div style={{"fontWeight":600,"fontSize":"12px","color":"#f59e0b"}}>Networking</div>
                            <div id="active-networking-status" style={{"fontSize":"10px","color":"#666"}}>Processing...</div>
                        </div>
                    </div>
                    <button id="stop-networking-dashboard" style={{"background":"#dc3545","color":"white","border":"none","padding":"5px 10px","borderRadius":"4px","fontSize":"10px","cursor":"pointer","fontWeight":600}}>
                        <IconStop size={14} /> Stop </button>
                    </div>
                </div>
                {/* Import Active */}
                <div id="active-import" style={{"display":"block","background":"linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)","padding":"10px 12px","borderRadius":"8px","marginBottom":"8px","borderLeft":"4px solid #22c55e"}}>
                    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between"}}>
                        <div style={{"display":"flex","alignItems":"center","gap":"8px"}}>
                            <IconDownload size={14} />
                            <div>
                                <div style={{"fontWeight":600,"fontSize":"12px","color":"#22c55e"}}>Import Automation</div>
                                <div id="active-import-status" style={{"fontSize":"10px","color":"#666"}}>Processing...</div>
                            </div>
                        </div>
                        <button id="stop-import-dashboard" style={{"background":"#dc3545","color":"white","border":"none","padding":"5px 10px","borderRadius":"4px","fontSize":"10px","cursor":"pointer","fontWeight":600}}>
                            <IconStop size={14} /> Stop </button>
                        </div>
                    </div>
                    {/* Post Scheduler Active */}
                    <div id="active-post-scheduler" style={{"display":"block","background":"linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%)","padding":"10px 12px","borderRadius":"8px","marginBottom":"8px","borderLeft":"4px solid #a855f7"}}>
                        <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between"}}>
                            <div style={{"display":"flex","alignItems":"center","gap":"8px"}}>
                                <IconEdit size={14} />
                                <div>
                                    <div style={{"fontWeight":600,"fontSize":"12px","color":"#a855f7"}}>Publishing Post...</div>
                                    <div id="active-post-scheduler-status" style={{"fontSize":"10px","color":"#666"}}>Posting to LinkedIn...</div>
                                </div>
                            </div>
                            <div className="spinner" style={{"width":"20px","height":"20px","border":"2px solid #e0e0e0","borderTopColor":"#a855f7","borderRadius":"50%","animation":"spin 1s linear infinite"}}>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Scheduled Posts Section */}
                <div id="scheduled-posts-section" style={{"paddingTop":"15px","borderTop":"1px solid #e0e0e0","marginTop":"15px"}}>
                    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"10px"}}>
                        <strong style={{"fontSize":"13px"}}>
                            <IconCalendar size={14} /> Scheduled Posts</strong>
                            <span id="scheduled-posts-count" style={{"fontSize":"11px","color":"#666","background":"#f0f0f0","padding":"2px 8px","borderRadius":"10px"}}>0</span>
                        </div>
                        <div id="scheduled-posts-list" style={{"maxHeight":"200px","overflowY":"auto"}}>
                            {/* Posts will be dynamically inserted here */}
                        </div>
                    </div>
                    {/* Business Hours Warning */}
                    <div id="business-hours-warning" style={{"display":"block","background":"linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)","padding":"10px 12px","borderRadius":"8px","marginTop":"10px","borderLeft":"4px solid #f59e0b"}}>
                        <div style={{"display":"flex","alignItems":"center","gap":"8px"}}>
                            <IconClock size={14} />
                            <div>
                                <div style={{"fontWeight":600,"fontSize":"11px","color":"#f59e0b"}}>Outside Business Hours</div>
                                <div id="business-hours-message" style={{"fontSize":"10px","color":"#666"}}>Scheduled tasks will run during active hours</div>
                            </div>
                        </div>
                    </div>
                    {/* Live Progress Section (Shows when automation is running) */}
                    <div id="live-progress-section" style={{"display":"block","paddingTop":"15px","borderTop":"1px solid #e0e0e0","position":"relative","zIndex":1000,"background":"white","marginTop":"15px"}}>
                        {/* Header with Stop Button */}
                        <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"8px"}}>
                            <strong style={{"fontSize":"13px"}}>
                                <IconRefresh size={14} /> Live Progress:</strong>
                                <div style={{"display":"flex","alignItems":"center","gap":"10px"}}>
                                    <span id="live-status-text" style={{"color":"#693fe9","fontWeight":600,"fontSize":"12px"}}>Idle</span>
                                    <button id="dashboard-stop-btn" style={{"display":"block","background":"#ff4444","color":"white","border":"none","padding":"4px 8px","borderRadius":"4px","fontSize":"10px","cursor":"pointer","fontWeight":600}}>
                                        <IconStop size={14} /> Stop</button>
                                    </div>
                                </div>
                                {/* Current Step */}
                                <div style={{"marginBottom":"8px"}}>
                                    <span id="live-current-step" style={{"fontSize":"12px","color":"#666"}}>-</span>
                                </div>
                                {/* Main Progress Bar */}
                                <div style={{"width":"100%","height":"28px","background":"#e0e0e0","borderRadius":"14px","overflow":"hidden","marginBottom":"6px"}}>
                                    <div id="live-progress-bar" style={{"height":"100%","background":"linear-gradient(90deg, #693fe9, #693fe9)","width":"0%","transition":"width 0.3s ease","display":"flex","alignItems":"center","justifyContent":"center","color":"white","fontWeight":"bold","fontSize":"12px"}}>
                                        <span id="live-progress-percentage">0%</span>
                                    </div>
                                </div>
                                {/* Detailed Progress Info */}
                                <div style={{"fontSize":"11px","color":"#666","textAlign":"center","marginBottom":"10px"}}>
                                    <span id="live-progress-detail">0/0 completed</span>
                                </div>
                                {/* Automation Details (hidden by default) */}
                                <div id="automation-details" style={{"display":"block","background":"#f8f9fa","padding":"10px","borderRadius":"8px","marginBottom":"10px"}}>
                                    <div style={{"fontSize":"11px","fontWeight":600,"marginBottom":"6px","color":"#693fe9"}}>
                                        <IconBot size={14} /> Automation Details:</div>
                                        <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"8px","fontSize":"10px"}}>
                                            <div>
                                                <IconFileText size={14} /> Posts Scraped: <span id="posts-scraped">0</span>
                                            </div>
                                            <div>
                                                <IconCheck size={14} /> Posts Selected: <span id="posts-selected">0</span>
                                            </div>
                                            <div>
                                                <IconX size={14} /> Posts Ignored: <span id="posts-ignored">0</span>
                                            </div>
                                            <div>
                                                <IconMapPin size={14} /> Current Post: <span id="current-post-number">-</span>
                                            </div>
                                        </div>
                                        <div style={{"marginTop":"6px","fontSize":"10px","color":"#666"}}>
                                            <span id="current-post-actions">Actions: -</span>
                                        </div>
                                    </div>
                                    {/* Networking Details (hidden by default) */}
                                    <div id="networking-details" style={{"display":"block","background":"#f8f9fa","padding":"10px","borderRadius":"8px","marginBottom":"10px"}}>
                                        <div style={{"fontSize":"11px","fontWeight":600,"marginBottom":"6px","color":"#693fe9"}}>
                                            <IconGlobe size={14} /> Networking Details:</div>
                                            <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"8px","fontSize":"10px"}}>
                                                <div>
                                                    <IconUsers size={14} /> Profiles Found: <span id="profiles-found">0</span>
                                                </div>
                                                <div>
                                                    <IconCheck size={14} /> Profiles Matched: <span id="profiles-matched">0</span>
                                                </div>
                                                <div>
                                                    <IconX size={14} /> Profiles Ignored: <span id="profiles-ignored">0</span>
                                                </div>
                                                <div>
                                                    <IconUserPlus size={14} /> Connections Sent: <span id="connections-sent">0</span>
                                                </div>
                                            </div>
                                            <div style={{"marginTop":"6px","fontSize":"10px","color":"#666"}}>
                                                <span id="current-profile-action">Current: -</span>
                                            </div>
                                        </div>
                                        {/* Real-time Action Steps */}
                                        <div id="action-steps" style={{"display":"block","fontSize":"10px","color":"#666"}}>
                                            <div style={{"display":"flex","justifyContent":"space-between","marginBottom":"2px"}}>
                                                <span>
                                                    <IconThumbsUp size={14} /> Liking:</span>
                                                    <span id="step-liking" style={{"color":"#ccc"}}>
                                                        <IconHourglass size={14} />
                                                    </span>
                                                </div>
                                                <div style={{"display":"flex","justifyContent":"space-between","marginBottom":"2px"}}>
                                                    <span>
                                                        <IconMessage size={14} /> Commenting:</span>
                                                        <span id="step-commenting" style={{"color":"#ccc"}}>
                                                            <IconHourglass size={14} />
                                                        </span>
                                                    </div>
                                                    <div style={{"display":"flex","justifyContent":"space-between","marginBottom":"2px"}}>
                                                        <span>
                                                            <IconRefresh size={14} /> Sharing:</span>
                                                            <span id="step-sharing" style={{"color":"#ccc"}}>
                                                                <IconHourglass size={14} />
                                                            </span>
                                                        </div>
                                                        <div style={{"display":"flex","justifyContent":"space-between"}}>
                                                            <span>
                                                                <IconPlus size={14} /> Following:</span>
                                                                <span id="step-following" style={{"color":"#ccc"}}>
                                                                    <IconHourglass size={14} />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="card">
                                                    <h4>
                                                        <IconZap size={14} /> Quick Actions</h4>
                                                        <div style={{"display":"grid","gridTemplateColumns":"repeat(2, 1fr)","gap":"8px"}}>
                                                            <button className="action-button" id="quick-post-writer">
                                                                <IconZap size={14} /> AI Writer</button>
                                                                <button className="action-button" id="quick-automation">
                                                                    <IconZap size={14} /> Auto Comment</button>
                                                                    <button className="action-button" id="quick-networking">
                                                                        <IconZap size={14} /> Connect</button>
                                                                        <button className="action-button" id="quick-import">
                                                                            <IconZap size={14} /> Import CSV</button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="card">
                                                                        <h4>
                                                                            <IconChart size={14} /> Monthly Usage & Limits</h4>
                                                                            {/* Comments */}
                                                                            <div style={{"marginBottom":"12px"}}>
                                                                                <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px"}}>
                                                                                    <span style={{"fontSize":"12px","fontWeight":600,"color":"#693fe9"}}>
                                                                                        <IconMessage size={14} /> Comments</span>
                                                                                        <span id="api-comments-progress" style={{"fontSize":"11px","fontWeight":700,"color":"#693fe9"}}>0/1500</span>
                                                                                    </div>
                                                                                    <div style={{"background":"#f0f2f5","borderRadius":"10px","height":"8px","overflow":"hidden"}}>
                                                                                        <div id="api-comments-bar" style={{"background":"linear-gradient(90deg, #693fe9 0%, #7c4dff 100%)","height":"100%","width":"0%","transition":"width 0.3s ease"}}>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                {/* Likes */}
                                                                                <div style={{"marginBottom":"12px"}}>
                                                                                    <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px"}}>
                                                                                        <span style={{"fontSize":"12px","fontWeight":600,"color":"#693fe9"}}>
                                                                                            <IconThumbsUp size={14} /> Likes</span>
                                                                                            <span id="api-likes-progress" style={{"fontSize":"11px","fontWeight":700,"color":"#693fe9"}}>0/3000</span>
                                                                                        </div>
                                                                                        <div style={{"background":"#f0f2f5","borderRadius":"10px","height":"8px","overflow":"hidden"}}>
                                                                                            <div id="api-likes-bar" style={{"background":"linear-gradient(90deg, #f093fb 0%, #f5576c 100%)","height":"100%","width":"0%","transition":"width 0.3s ease"}}>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    {/* Shares */}
                                                                                    <div style={{"marginBottom":"12px"}}>
                                                                                        <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px"}}>
                                                                                            <span style={{"fontSize":"12px","fontWeight":600,"color":"#693fe9"}}>
                                                                                                <IconShare size={14} /> Shares</span>
                                                                                                <span id="api-shares-progress" style={{"fontSize":"11px","fontWeight":700,"color":"#693fe9"}}>0/600</span>
                                                                                            </div>
                                                                                            <div style={{"background":"#f0f2f5","borderRadius":"10px","height":"8px","overflow":"hidden"}}>
                                                                                                <div id="api-shares-bar" style={{"background":"linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)","height":"100%","width":"0%","transition":"width 0.3s ease"}}>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        {/* Follows */}
                                                                                        <div style={{"marginBottom":"12px"}}>
                                                                                            <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px"}}>
                                                                                                <span style={{"fontSize":"12px","fontWeight":600,"color":"#693fe9"}}>
                                                                                                    <IconPlus size={14} /> Follows</span>
                                                                                                    <span id="api-follows-progress" style={{"fontSize":"11px","fontWeight":700,"color":"#693fe9"}}>0/1500</span>
                                                                                                </div>
                                                                                                <div style={{"background":"#f0f2f5","borderRadius":"10px","height":"8px","overflow":"hidden"}}>
                                                                                                    <div id="api-follows-bar" style={{"background":"linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)","height":"100%","width":"0%","transition":"width 0.3s ease"}}>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            {/* Connections */}
                                                                                            <div style={{"marginBottom":"12px"}}>
                                                                                                <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px"}}>
                                                                                                    <span style={{"fontSize":"12px","fontWeight":600,"color":"#693fe9"}}>
                                                                                                        <IconUserPlus size={14} /> Connections</span>
                                                                                                        <span id="api-connections-progress" style={{"fontSize":"11px","fontWeight":700,"color":"#693fe9"}}>0/900</span>
                                                                                                    </div>
                                                                                                    <div style={{"background":"#f0f2f5","borderRadius":"10px","height":"8px","overflow":"hidden"}}>
                                                                                                        <div id="api-connections-bar" style={{"background":"linear-gradient(90deg, #fa709a 0%, #fee140 100%)","height":"100%","width":"0%","transition":"width 0.3s ease"}}>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                                {/* AI Posts */}
                                                                                                <div style={{"marginBottom":"12px"}}>
                                                                                                    <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px"}}>
                                                                                                        <span style={{"fontSize":"12px","fontWeight":600,"color":"#693fe9"}}>
                                                                                                            <IconSparkles size={14} /> AI Posts</span>
                                                                                                            <span id="api-ai-posts-progress" style={{"fontSize":"11px","fontWeight":700,"color":"#693fe9"}}>0/300</span>
                                                                                                        </div>
                                                                                                        <div style={{"background":"#f0f2f5","borderRadius":"10px","height":"8px","overflow":"hidden"}}>
                                                                                                            <div id="api-ai-posts-bar" style={{"background":"linear-gradient(90deg, #fbc2eb 0%, #a18cd1 100%)","height":"100%","width":"0%","transition":"width 0.3s ease"}}>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    {/* AI Comments */}
                                                                                                    <div style={{"marginBottom":"12px"}}>
                                                                                                        <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px"}}>
                                                                                                            <span style={{"fontSize":"12px","fontWeight":600,"color":"#693fe9"}}>
                                                                                                                <IconBot size={14} /> AI Comments</span>
                                                                                                                <span id="api-ai-comments-progress" style={{"fontSize":"11px","fontWeight":700,"color":"#693fe9"}}>0/1500</span>
                                                                                                            </div>
                                                                                                            <div style={{"background":"#f0f2f5","borderRadius":"10px","height":"8px","overflow":"hidden"}}>
                                                                                                                <div id="api-ai-comments-bar" style={{"background":"linear-gradient(90deg, #ff9a9e 0%, #ff6b6b 100%)","height":"100%","width":"0%","transition":"width 0.3s ease"}}>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        {/* AI Topics */}
                                                                                                        <div style={{"marginBottom":"12px"}}>
                                                                                                            <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px"}}>
                                                                                                                <span style={{"fontSize":"12px","fontWeight":600,"color":"#693fe9"}}>
                                                                                                                    <IconLightbulb size={14} /> AI Topics</span>
                                                                                                                    <span id="api-ai-topics-progress" style={{"fontSize":"11px","fontWeight":700,"color":"#693fe9"}}>0/300</span>
                                                                                                                </div>
                                                                                                                <div style={{"background":"#f0f2f5","borderRadius":"10px","height":"8px","overflow":"hidden"}}>
                                                                                                                    <div id="api-ai-topics-bar" style={{"background":"linear-gradient(90deg, #ffeaa7 0%, #ffd93d 100%)","height":"100%","width":"0%","transition":"width 0.3s ease"}}>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            {/* Import Profiles */}
                                                                                                            <div>
                                                                                                                <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"4px"}}>
                                                                                                                    <span style={{"fontSize":"12px","fontWeight":600,"color":"#693fe9"}}>
                                                                                                                        <IconDownload size={14} /> Import Profiles</span>
                                                                                                                        <span id="api-import-profiles-progress" style={{"fontSize":"11px","fontWeight":700,"color":"#693fe9"}}>0/100</span>
                                                                                                                    </div>
                                                                                                                    <div style={{"background":"#f0f2f5","borderRadius":"10px","height":"8px","overflow":"hidden"}}>
                                                                                                                        <div id="api-import-profiles-bar" style={{"background":"linear-gradient(90deg, #38d9a9 0%, #20c997 100%)","height":"100%","width":"0%","transition":"width 0.3s ease"}}>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
        </>
    );
}
