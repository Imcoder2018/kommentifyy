'use client';
import React from 'react';
import { IconChart, IconClock, IconLightbulb, IconLink, IconMail, IconPlus, IconRefresh, IconRocket, IconSearch, IconStop, IconTarget, IconX, IconZap } from './Icons';

export default function NetworkTab() {
    return (
        <>
            {/* TAB CONTENT: NETWORKING */} {/* Live Status Log Bar */}
            <div id="networking-status-bar" style={{"background":"linear-gradient(135deg, #693fe9 0%, #7c4dff 100%)","color":"white","padding":"10px 15px","borderRadius":"10px","marginBottom":"12px","fontSize":"12px","display":"block","alignItems":"center","gap":"10px","boxShadow":"0 2px 8px rgba(105, 63, 233, 0.3)"}}>
                <div style={{"display":"flex","alignItems":"center","gap":"8px","flex":1}}>
                    <span id="networking-status-icon" style={{"fontSize":"16px"}}>
                        <IconRefresh size={14} />
                    </span>
                    <span id="networking-status-text" style={{"fontWeight":500}}>Ready</span>
                </div>
                <div id="networking-status-timer" style={{"fontSize":"11px","opacity":"0.8","fontFamily":"monospace"}}>
                </div>
            </div>
            <div className="card" style={{"background":"linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)"}}>
                {/* Header */}
                <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"15px","paddingBottom":"12px","borderBottom":"2px solid #e0e0e0"}}>
                    <div>
                        <h4 style={{"margin":"0 0 4px 0"}}>
                            <IconSearch size={14} /> Auto Search & Connect</h4>
                            <small style={{"color":"#666"}}>Search LinkedIn and auto-send connection requests</small>
                        </div>
                        <div style={{"display":"flex","alignItems":"center","gap":"6px","fontSize":"11px","color":"#666"}}>
                            <span>
                                <IconClock size={14} /> Auto-Schedule</span>
                                <label className="switch" style={{"transform":"scale(0.7)"}}>
                                    <input type="checkbox" id="people-scheduler-enabled" defaultChecked={true} />
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
                                        <span>Next: <strong id="people-next-execution-time">--</strong>
                                    </span>
                                    <span>
                                        <strong id="people-countdown-timer">--:--:--</strong>
                                    </span>
                                </div>
                            </div>
                            <div id="people-schedule-list" style={{"maxHeight":"100px","overflowY":"auto","paddingRight":"4px"}}>
                                <small style={{"color":"#999"}}>No schedules</small>
                            </div>
                        </div>
                        {/* Search Configuration Card */}
                        <div style={{"background":"white","padding":"12px","borderRadius":"8px","marginBottom":"12px","border":"2px solid #e0e0e0"}}>
                            <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                <span style={{"fontSize":"16px"}}>
                                    <IconTarget size={14} />
                                </span>
                                <strong style={{"color":"#693fe9","fontSize":"13px"}}>Search Configuration</strong>
                            </div>
                            {/* Search Source Toggle */}
                            <div style={{"display":"flex","gap":"8px","marginBottom":"10px"}}>
                                <label style={{"flex":1,"display":"flex","alignItems":"center","gap":"6px","padding":"6px 10px","background":"#f0f8ff","border":"2px solid #693fe9","borderRadius":"6px","cursor":"pointer"}}>
                                    <input type="radio" name="search-source" id="search-by-keyword" value="keyword" defaultChecked={true} style={{"accentColor":"#693fe9"}} />
                                    <span style={{"fontSize":"11px","fontWeight":600,"color":"#693fe9"}}>
                                        <IconSearch size={14} /> Keyword</span>
                                    </label>
                                    <label style={{"flex":1,"display":"flex","alignItems":"center","gap":"6px","padding":"6px 10px","background":"#f8f9fa","border":"2px solid #e0e0e0","borderRadius":"6px","cursor":"pointer"}} id="search-by-url-label">
                                        <input type="radio" name="search-source" id="search-by-url" value="url" style={{"accentColor":"#693fe9"}} />
                                        <span style={{"fontSize":"11px","fontWeight":600,"color":"#666"}}>
                                            <IconLink size={14} /> Search URL</span>
                                        </label>
                                    </div>
                                    {/* Keyword Input */}
                                    <div id="keyword-input-section" style={{"marginBottom":"10px"}}>
                                        <label htmlFor="search-keyword" style={{"display":"block","marginBottom":"4px","fontSize":"11px","color":"#666","fontWeight":600}}>Search Keyword:</label>
                                        <input type="text" id="search-keyword" placeholder="e.g., VP of Sales, Growth Hacker, Marketing Director" style={{"width":"100%","padding":"8px","fontSize":"12px","border":"2px solid #e0e0e0","borderRadius":"6px"}} />
                                        <small style={{"display":"block","marginTop":"3px","color":"#999","fontSize":"10px"}}>
                                            <IconLightbulb size={14} /> Supports Boolean: "VP OR Vice President" AND Sales NOT Intern </small>
                                        </div>
                                        {/* URL Input (Hidden by default) */}
                                        <div id="url-input-section" style={{"marginBottom":"10px","display":"block"}}>
                                            <label htmlFor="people-search-url" style={{"display":"block","marginBottom":"4px","fontSize":"11px","color":"#666","fontWeight":600}}>LinkedIn People Search URL:</label>
                                            <input type="text" id="people-search-url" placeholder="https://www.linkedin.com/search/results/people/?keywords=..." style={{"width":"100%","padding":"8px","fontSize":"12px","border":"2px solid #e0e0e0","borderRadius":"6px"}} />
                                            <small style={{"display":"block","marginTop":"3px","color":"#999","fontSize":"10px"}}>
                                                <IconLightbulb size={14} /> Paste a LinkedIn people search URL with your filters already applied </small>
                                            </div>
                                            <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                                <input type="time" id="people-schedule-time-input" style={{"padding":"6px 8px","fontSize":"11px","width":"85px","border":"2px solid #e0e0e0","borderRadius":"4px"}} />
                                                <button type="button" id="add-people-schedule" className="action-button" style={{"padding":"6px 10px","fontSize":"11px","background":"#693fe9","whiteSpace":"nowrap"}}>
                                                    <IconPlus size={14} /> Add Schedule</button>
                                                </div>
                                                <button className="start-button" id="start-people-search" style={{"width":"100%","padding":"10px","fontSize":"13px","fontWeight":600,"background":"linear-gradient(135deg, #693fe9 0%, #693fe9 100%)","marginBottom":0}}>
                                                    <IconRocket size={14} />   Start Networking </button>
                                                    <button className="start-button secondary" id="stop-people-search" style={{"display":"block","width":"100%","padding":"10px","fontSize":"13px","fontWeight":600,"background":"#dc3545","marginTop":0}}>
                                                        <IconStop size={14} /> Stop People Search </button>
                                                    </div>
                                                    {/* 2-Column Layout: Settings (Left) + Filters (Right) */}
                                                    <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"12px","marginBottom":"12px"}}>
                                                        {/* Left Column: Connection Settings */}
                                                        <div style={{"background":"white","padding":"12px","borderRadius":"8px","border":"2px solid #e0e0e0"}}>
                                                            <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                                                <span style={{"fontSize":"16px"}}>
                                                                    <IconChart size={14} />
                                                                </span>
                                                                <strong style={{"color":"#693fe9","fontSize":"13px"}}>Connection Settings</strong>
                                                            </div>
                                                            <div style={{"marginBottom":"10px"}}>
                                                                <label style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"4px","fontSize":"11px"}}>
                                                                    <span>Connections:</span>
                                                                    <strong id="connect-quota-display" style={{"color":"#693fe9"}}>10</strong>
                                                                </label>
                                                                <input type="range" id="connect-quota" min="1" max="50" value="10" style={{"width":"100%"}} />
                                                                <small style={{"display":"block","marginTop":"2px","color":"#999","fontSize":"10px"}}>Max per session (50/day recommended)</small>
                                                            </div>
                                                            <div>
                                                                <label htmlFor="exclude-headline-terms" style={{"display":"block","marginBottom":"4px","fontSize":"11px","color":"#666","fontWeight":600}}>
                                                                    <IconX size={14} /> Exclude Headline Terms:</label>
                                                                    <input type="text" id="exclude-headline-terms" placeholder="e.g., Aspiring, Former, Student" style={{"width":"100%","padding":"6px","fontSize":"11px","border":"2px solid #e0e0e0","borderRadius":"4px"}} />
                                                                    <small style={{"display":"block","marginTop":"2px","color":"#999","fontSize":"10px"}}>Comma-separated terms to skip</small>
                                                                </div>
                                                            </div>
                                                            {/* Right Column: Search Filters */}
                                                            <div style={{"background":"white","padding":"12px","borderRadius":"8px","border":"2px solid #e0e0e0"}}>
                                                                <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"10px"}}>
                                                                    <span style={{"fontSize":"16px"}}>
                                                                        <IconSearch size={14} />
                                                                    </span>
                                                                    <strong style={{"color":"#693fe9","fontSize":"13px"}}>Search Filters</strong>
                                                                </div>
                                                                <div style={{"display":"flex","flexDirection":"column","gap":"8px","fontSize":"12px"}}>
                                                                    <label style={{"display":"flex","alignItems":"center","gap":"6px","cursor":"pointer"}}>
                                                                        <input type="checkbox" id="use-boolean-search" defaultChecked={true} style={{"width":"16px","height":"16px"}} />
                                                                        <span>Use Boolean Logic</span>
                                                                    </label>
                                                                    <label style={{"display":"flex","alignItems":"center","gap":"6px","cursor":"pointer"}}>
                                                                        <input type="checkbox" id="filter-network" defaultChecked={true} style={{"width":"16px","height":"16px"}} />
                                                                        <span>2nd/3rd Degree Only</span>
                                                                    </label>
                                                                    <label style={{"display":"flex","alignItems":"center","gap":"6px","cursor":"pointer"}}>
                                                                        <input type="checkbox" id="send-with-note" style={{"width":"16px","height":"16px"}} />
                                                                        <span>Send with Note</span>
                                                                    </label>
                                                                    <label style={{"display":"flex","alignItems":"center","gap":"6px","cursor":"pointer"}}>
                                                                        <input type="checkbox" id="send-connection-request" style={{"width":"16px","height":"16px"}} defaultChecked={true} />
                                                                        <span>
                                                                            <IconMail size={14} /> Send Connection Request</span>
                                                                        </label>
                                                                        <label style={{"display":"flex","alignItems":"center","gap":"6px","cursor":"pointer"}}>
                                                                            <input type="checkbox" id="extract-contact-info" style={{"width":"16px","height":"16px"}} />
                                                                            <span>
                                                                                <IconMail size={14} /> Extract Contact Info</span>
                                                                            </label>
                                                                        </div>
                                                                        <small style={{"display":"block","color":"#999","marginTop":"8px","fontSize":"10px"}}>
                                                                            <IconLightbulb size={14} /> Check at least one action: Send Request or Extract Contact Info </small>
                                                                        </div>
                                                                    </div>
                                                                    {/* Connection Message Card */}
                                                                    <div style={{"background":"white","padding":"12px","borderRadius":"8px","marginBottom":"12px","border":"2px solid #e0e0e0"}}>
                                                                        <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"10px"}}>
                                                                            <div style={{"display":"flex","alignItems":"center","gap":"8px"}}>
                                                                                <span style={{"fontSize":"16px"}}>
                                                                                    <IconMail size={14} />
                                                                                </span>
                                                                                <strong style={{"color":"#693fe9","fontSize":"13px"}}>Connection Message (Optional)</strong>
                                                                            </div>
                                                                            <small id="message-char-count" style={{"color":"#693fe9","fontWeight":"bold","fontSize":"11px"}}>0/300</small>
                                                                        </div>
                                                                        <textarea id="connection-message" rows={3} placeholder="Hi [Name],&#10;&#10;I just saw your profile, and I'm amazed with your experience and would love to connect with you." maxLength={300} style={{"width":"100%","padding":"10px","fontSize":"12px","border":"2px solid #e0e0e0","borderRadius":"6px","resize":"vertical","fontFamily":"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"}}>Hi, [Name] I just saw your profile, and I'm amazed with your experience and would love to connect with you.</textarea>
                                                                        <small style={{"display":"block","marginTop":"3px","color":"#999","fontSize":"10px"}}> Use [Name] for personalization </small>
                                                                    </div>
                                                                    {/* Progress Indicator */}
                                                                    <div id="people-search-progress" style={{"display":"block","marginBottom":"12px","padding":"12px","background":"#f0f8ff","borderRadius":"6px","borderLeft":"4px solid #693fe9"}}>
                                                                        <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"8px"}}>
                                                                            <span style={{"fontWeight":600,"color":"#693fe9","fontSize":"12px"}}>Processing...</span>
                                                                            <span id="people-progress-count" style={{"fontSize":"11px","color":"#666"}}>0/0</span>
                                                                        </div>
                                                                        <div style={{"width":"100%","height":"6px","background":"#e0e0e0","borderRadius":"3px","overflow":"hidden"}}>
                                                                            <div id="people-progress-bar" style={{"height":"100%","background":"linear-gradient(90deg, #693fe9, #693fe9)","width":"0%","transition":"width 0.3s ease"}}>
                                                                            </div>
                                                                        </div>
                                                                        <div id="people-progress-status" style={{"fontSize":"10px","color":"#666","marginTop":"6px"}}> Initializing...</div>
                                                                    </div>
                                                                    {/* Status Display */}
                                                                    <div id="people-search-status" style={{"display":"block","background":"white","padding":"12px","borderRadius":"8px","border":"2px solid #e0e0e0","marginBottom":"12px"}}>
                                                                        <div style={{"fontSize":"11px","lineHeight":"1.8"}}>
                                                                            <div style={{"display":"flex","justifyContent":"space-between"}}>
                                                                                <strong>Status:</strong>
                                                                                <span id="search-status-text">Ready</span>
                                                                            </div>
                                                                            <div style={{"display":"flex","justifyContent":"space-between"}}>
                                                                                <strong>Profiles Found:</strong>
                                                                                <span id="profiles-found">0</span>
                                                                            </div>
                                                                            <div style={{"display":"flex","justifyContent":"space-between"}}>
                                                                                <strong>Connections Sent:</strong>
                                                                                <span id="connections-sent">0</span>
                                                                            </div>
                                                                            <div style={{"display":"flex","justifyContent":"space-between"}}>
                                                                                <strong>Success Rate:</strong>
                                                                                <span id="success-rate">0%</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {/* Start Button Copy */}
                                                                    <div>
                                                                        <button className="start-button" id="start-people-search-bottom" style={{"width":"100%","padding":"12px","fontSize":"14px","fontWeight":600,"background":"linear-gradient(135deg, #693fe9 0%, #693fe9 100%)"}}>
                                                                            <IconRocket size={14} />   Start Networking </button>
                                                                            <button className="start-button secondary" id="stop-people-search-bottom" style={{"display":"block","width":"100%","padding":"12px","fontSize":"14px","fontWeight":600,"background":"#dc3545","marginTop":"8px"}}>
                                                                                <IconStop size={14} /> Stop People Search </button>
                                                                            </div>
                                                                        </div>
        </>
    );
}
