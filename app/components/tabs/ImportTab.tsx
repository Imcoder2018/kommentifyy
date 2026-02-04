'use client';
import React from 'react';
import { IconBot, IconChart, IconDownload, IconEdit, IconFolder, IconHeart, IconLightbulb, IconMail, IconRefresh, IconRocket, IconShare, IconStop, IconThumbsUp, IconTrash, IconUser, IconUserPlus, IconZap } from './Icons';

export default function ImportTab() {
    return (
        <>
            {/* TAB CONTENT: IMPORT */} {/* Live Status Log Bar */}
            <div id="import-status-bar" style={{"background":"linear-gradient(135deg, #693fe9 0%, #7c4dff 100%)","color":"white","padding":"10px 15px","borderRadius":"10px","marginBottom":"12px","fontSize":"12px","display":"block","alignItems":"center","gap":"10px","boxShadow":"0 2px 8px rgba(102, 126, 234, 0.3)"}}>
                <div style={{"display":"flex","alignItems":"center","gap":"8px","flex":1}}>
                    <span id="import-status-icon" style={{"fontSize":"16px"}}>
                        <IconRefresh size={14} />
                    </span>
                    <span id="import-status-text" style={{"fontWeight":500}}>Ready</span>
                </div>
                <div id="import-status-timer" style={{"fontSize":"11px","opacity":"0.8","fontFamily":"monospace"}}>
                </div>
            </div>
            {/* Import LinkedIn Profiles Section */}
            <div className="card" style={{"marginBottom":"20px"}}>
                <h4 style={{"marginBottom":"15px"}}>
                    <IconDownload size={14} /> Import LinkedIn Profiles</h4>
                    <p style={{"marginBottom":"15px","color":"#666","fontSize":"13px"}}> Import LinkedIn profiles for automated engagement. You can either paste profile URLs or upload a CSV file. </p>
                    <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"20px"}}>
                        {/* Text Input Method */}
                        <div>
                            <label style={{"fontWeight":600,"display":"block","marginBottom":"8px"}}>
                                <IconEdit size={14} /> Paste Profile URLs</label>
                                <textarea id="profile-urls-input" placeholder="Paste LinkedIn profile URLs here, each on a new line: https://www.linkedin.com/in/john-doe-123456/ https://www.linkedin.com/in/jane-smith-789012/ https://www.linkedin.com/in/example-profile/" style={{"width":"100%","height":"120px","padding":"10px","border":"2px solid #e0e0e0","borderRadius":"6px","fontSize":"13px","fontFamily":"monospace","resize":"vertical"}}>
                                </textarea>
                                <div style={{"fontSize":"11px","color":"#666","marginTop":"5px"}}> Profiles detected: <strong id="profile-count">0</strong>
                            </div>
                        </div>
                        {/* CSV Upload Method */}
                        <div>
                            <label style={{"fontWeight":600,"display":"block","marginBottom":"8px"}}>
                                <IconFolder size={14} /> Upload CSV File</label>
                                <div style={{"border":"2px dashed #e0e0e0","borderRadius":"6px","padding":"20px","textAlign":"center","background":"#f8f9fa"}}>
                                    <input type="file" id="csv-upload" accept=".csv" style={{"display":"block"}} />
                                    <button style={{"background":"#693fe9","color":"white","border":"none","padding":"8px 16px","borderRadius":"4px","cursor":"pointer"}}> Choose CSV File </button>
                                    <div style={{"marginTop":"8px","fontSize":"11px","color":"#666"}}> CSV should have profile URLs in the first column </div>
                                    <div id="csv-status" style={{"marginTop":"8px","fontSize":"12px"}}>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Profile List Display */}
                        <div id="imported-profiles-section" style={{"marginTop":"20px","display":"block"}}>
                            <h5 style={{"marginBottom":"10px"}}>
                                <IconZap size={14} /> Imported Profiles (<span id="imported-count">0</span>)</h5>
                                <div id="imported-profiles-list" style={{"maxHeight":"200px","overflowY":"auto","border":"1px solid #e0e0e0","borderRadius":"6px","padding":"10px","background":"#f8f9fa"}}>
                                    {/* Profiles will be listed here */}
                                </div>
                            </div>
                            {/* Import Credits Display */}
                            <div style={{"marginTop":"20px","padding":"12px","background":"linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)","borderLeft":"4px solid #693fe9","borderRadius":"4px"}}>
                                <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"8px"}}>
                                    <strong style={{"color":"#693fe9","fontSize":"13px"}}>
                                        <IconZap size={14} /> Import Credits</strong>
                                        <span style={{"fontSize":"11px","color":"#693fe9"}}>Plan: <strong id="import-plan-name">Free</strong>
                                    </span>
                                </div>
                                <div style={{"display":"flex","alignItems":"center","gap":"15px"}}>
                                    <div style={{"flex":1,"textAlign":"center","padding":"8px","background":"white","borderRadius":"6px"}}>
                                        <div style={{"fontSize":"24px","fontWeight":"bold","color":"#693fe9"}} id="import-credits-remaining">0</div>
                                        <div style={{"fontSize":"10px","color":"#666"}}>Remaining</div>
                                    </div>
                                    <div style={{"flex":1,"textAlign":"center","padding":"8px","background":"white","borderRadius":"6px"}}>
                                        <div style={{"fontSize":"24px","fontWeight":"bold","color":"#7c4dff"}} id="import-credits-total">0</div>
                                        <div style={{"fontSize":"10px","color":"#666"}}>Monthly Total</div>
                                    </div>
                                    <div style={{"flex":1,"textAlign":"center","padding":"8px","background":"white","borderRadius":"6px"}}>
                                        <div style={{"fontSize":"24px","fontWeight":"bold","color":"#ff9800"}} id="import-credits-used">0</div>
                                        <div style={{"fontSize":"10px","color":"#666"}}>Used</div>
                                    </div>
                                </div>
                                <small style={{"display":"block","color":"#693fe9","fontSize":"11px","marginTop":"8px"}}>
                                    <IconLightbulb size={14} /> Each profile processed uses 1 credit, buy more 500 Credits per 1$ </small>
                                </div>
                            </div>
                            {/* Smart Profile Automation - Redesigned with #693fe9 theme */}
                            <div className="card" style={{"background":"linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)","border":"2px solid #e0e0e0","padding":"16px","marginBottom":"20px"}}>
                                <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"14px","paddingBottom":"12px","borderBottom":"2px solid #e0e0e0"}}>
                                    <div style={{"display":"flex","alignItems":"center","gap":"10px"}}>
                                        <IconZap size={14} />
                                        <div>
                                            <h4 style={{"margin":0,"color":"#693fe9","fontSize":"15px","fontWeight":700}}>Smart Profile Automation</h4>
                                            <small style={{"color":"#666","fontSize":"11px"}}>Engage with profiles - connect, like, comment & grow network</small>
                                        </div>
                                    </div>
                                </div>
                                {/* Connection Option */}
                                <div style={{"background":"#f0f8ff","borderRadius":"8px","padding":"10px","marginBottom":"10px","border":"1px solid #e0e0e0"}}>
                                    <label style={{"display":"flex","alignItems":"center","gap":"10px","cursor":"pointer"}}>
                                        <input type="checkbox" id="combined-send-connections" defaultChecked={true} style={{"width":"16px","height":"16px","accentColor":"#693fe9"}} />
                                        <div>
                                            <span style={{"color":"#333","fontWeight":600,"fontSize":"12px"}}>
                                                <IconUserPlus size={14} /><small style={{"display":"block","color":"#666","fontSize":"10px","marginTop":"2px"}}>Send Connection Requests</small></span>
                                                <small style={{"display":"block","color":"#666","fontSize":"10px","marginTop":"2px"}}>Automatically connect with each profile</small>
                                            </div>
                                        </label>
                                    </div>
                                    {/* Engagement Actions Grid */}
                                    <div style={{"background":"white","borderRadius":"8px","padding":"10px","marginBottom":"10px","border":"1px solid #e0e0e0"}}>
                                        <div style={{"fontSize":"11px","fontWeight":600,"color":"#693fe9","marginBottom":"8px"}}>
                                            <IconHeart size={14} /> Engagement Actions</div>
                                            <div style={{"display":"grid","gridTemplateColumns":"repeat(4, 1fr)","gap":"6px"}}>
                                                <label style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px","cursor":"pointer","padding":"6px","background":"#f8f9fa","borderRadius":"6px","border":"1px solid #e0e0e0"}}>
                                                    <input type="checkbox" id="combined-enable-likes" defaultChecked={true} style={{"width":"14px","height":"14px","accentColor":"#693fe9"}} />
                                                    <span style={{"fontSize":"10px","color":"#333"}}>
                                                        <IconThumbsUp size={14} /> Likes</span>
                                                    </label>
                                                    <label style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px","cursor":"pointer","padding":"6px","background":"#f8f9fa","borderRadius":"6px","border":"1px solid #e0e0e0"}}>
                                                        <input type="checkbox" id="combined-enable-comments" defaultChecked={true} style={{"width":"14px","height":"14px","accentColor":"#693fe9"}} />
                                                        <span style={{"fontSize":"10px","color":"#333"}}>
                                                            <IconBot size={14} /> AI Comments</span>
                                                        </label>
                                                        <label style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px","cursor":"pointer","padding":"6px","background":"#f8f9fa","borderRadius":"6px","border":"1px solid #e0e0e0"}}>
                                                            <input type="checkbox" id="combined-enable-shares" style={{"width":"14px","height":"14px","accentColor":"#693fe9"}} />
                                                            <span style={{"fontSize":"10px","color":"#333"}}>
                                                                <IconShare size={14} /> Reshares</span>
                                                            </label>
                                                            <label style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px","cursor":"pointer","padding":"6px","background":"#f8f9fa","borderRadius":"6px","border":"1px solid #e0e0e0"}}>
                                                                <input type="checkbox" id="combined-enable-follows" style={{"width":"14px","height":"14px","accentColor":"#693fe9"}} />
                                                                <span style={{"fontSize":"10px","color":"#333"}}>
                                                                    <IconUserPlus size={14} /> Follow</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        {/* Smart Options Row */}
                                                        <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"8px","marginBottom":"10px"}}>
                                                            <div style={{"background":"#f8f9fa","borderRadius":"6px","padding":"8px","border":"1px solid #e0e0e0"}}>
                                                                <label style={{"display":"flex","alignItems":"center","gap":"6px","cursor":"pointer"}}>
                                                                    <input type="checkbox" id="combined-enable-random-mode" style={{"width":"14px","height":"14px","accentColor":"#693fe9"}} />
                                                                    <div>
                                                                        <span style={{"color":"#333","fontWeight":600,"fontSize":"11px"}}>
                                                                            <IconZap size={14} /> Smart Random</span>
                                                                            <small style={{"display":"block","color":"#666","fontSize":"9px"}}>Pick 1 random action per post</small>
                                                                        </div>
                                                                    </label>
                                                                </div>
                                                                <div style={{"background":"#f8f9fa","borderRadius":"6px","padding":"8px","border":"1px solid #e0e0e0"}}>
                                                                    <label style={{"display":"flex","alignItems":"center","gap":"6px","cursor":"pointer"}}>
                                                                        <input type="checkbox" id="combined-extract-contact-info" style={{"width":"14px","height":"14px","accentColor":"#693fe9"}} />
                                                                        <div>
                                                                            <span style={{"color":"#333","fontWeight":600,"fontSize":"11px"}}>
                                                                                <IconMail size={14} /> Extract Contacts</span>
                                                                                <small style={{"display":"block","color":"#666","fontSize":"9px"}}>Save emails & phone numbers</small>
                                                                            </div>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                {/* Posts per Profile */}
                                                                <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"12px"}}>
                                                                    <span style={{"color":"#333","fontSize":"11px","fontWeight":500}}>Posts per profile:</span>
                                                                    <select id="combined-posts-per-profile" style={{"padding":"5px 10px","border":"1px solid #e0e0e0","borderRadius":"4px","fontSize":"11px","background":"white"}}>
                                                                        <option value="1">1 post</option>
                                                                        <option value="2">2 posts</option>
                                                                        <option value="3">3 posts</option>
                                                                        <option value="4">4 posts</option>
                                                                        <option value="5">5 posts</option>
                                                                    </select>
                                                                </div>
                                                                {/* Action Buttons */}
                                                                <div style={{"display":"flex","gap":"8px"}}>
                                                                    <button id="start-combined-automation" className="action-button" style={{"flex":1,"padding":"12px","fontSize":"13px","background":"#693fe9","color":"white","border":"none","borderRadius":"8px","fontWeight":600,"boxShadow":"0 3px 10px rgba(105, 63, 233, 0.3)"}}>
                                                                        <IconRocket size={14} /> Launch Automation </button>
                                                                        <button id="stop-combined-automation" className="action-button" style={{"display":"block","padding":"12px","fontSize":"13px","background":"#dc3545","color":"white","border":"none","borderRadius":"8px","minWidth":"80px"}}>
                                                                            <IconStop size={14} /> Stop </button>
                                                                        </div>
                                                                        {/* Progress Bar */}
                                                                        <div id="combined-progress" style={{"marginTop":"10px","display":"block"}}>
                                                                            <div style={{"display":"flex","justifyContent":"space-between","fontSize":"10px","color":"#666","marginBottom":"4px"}}>
                                                                                <span>Processing: <strong id="combined-current">0</strong> / <strong id="combined-total">0</strong>
                                                                            </span>
                                                                            <span id="combined-percentage">0%</span>
                                                                        </div>
                                                                        <div style={{"background":"#e0e0e0","height":"6px","borderRadius":"3px","overflow":"hidden"}}>
                                                                            <div id="combined-progress-bar" style={{"width":"0%","height":"100%","background":"#693fe9","transition":"width 0.3s","borderRadius":"3px"}}>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {/* Action History Section - Redesigned */}
                                                                <div className="card" style={{"padding":"12px"}}>
                                                                    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"10px"}}>
                                                                        <h4 style={{"margin":0,"fontSize":"13px"}}>
                                                                            <IconChart size={14} /> Import Actions History</h4>
                                                                            <div style={{"display":"flex","gap":"6px","alignItems":"center"}}>
                                                                                <label style={{"display":"flex","alignItems":"center","gap":"4px","fontSize":"11px","cursor":"pointer","background":"#f0f0f0","padding":"4px 8px","borderRadius":"4px"}}>
                                                                                    <input type="checkbox" id="show-post-details" style={{"width":"14px","height":"14px"}} />
                                                                                    <span>Show Posts</span>
                                                                                </label>
                                                                                <button id="export-import-csv" className="action-button" style={{"padding":"4px 10px","fontSize":"11px"}}>
                                                                                    <IconDownload size={14} />
                                                                                </button>
                                                                                <button id="refresh-import-history" className="action-button secondary" style={{"padding":"4px 10px","fontSize":"11px"}}>
                                                                                    <IconRefresh size={14} />
                                                                                </button>
                                                                                <button id="clear-import-history" className="action-button secondary" style={{"padding":"4px 10px","fontSize":"11px"}}>
                                                                                    <IconTrash size={14} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <input type="text" id="import-history-search" placeholder=" Search profiles..." style={{"width":"100%","padding":"6px 10px","fontSize":"11px","marginBottom":"8px","border":"1px solid #e0e0e0","borderRadius":"4px"}} />
                                                                        <div style={{"display":"flex","gap":"12px","marginBottom":"8px","fontSize":"11px","color":"#6c757d"}}>
                                                                            <span>Profiles: <strong id="total-import-sessions">0</strong>
                                                                        </span>
                                                                        <span>Connections: <strong id="total-connections-sent">0</strong>
                                                                    </span>
                                                                    <span>Posts: <strong id="total-posts-engaged">0</strong>
                                                                </span>
                                                                <span>Comments: <strong id="total-comments-generated">0</strong>
                                                            </span>
                                                            <span>Rate: <strong id="import-success-rate">0%</strong>
                                                        </span>
                                                    </div>
                                                    <div style={{"maxHeight":"350px","overflowY":"auto","border":"1px solid #e0e0e0","borderRadius":"6px"}}>
                                                        <table style={{"width":"100%","fontSize":"10px","borderCollapse":"collapse"}}>
                                                            <thead style={{"background":"linear-gradient(135deg, #667eea 0%, #764ba2 100%)","color":"white","position":"sticky","top":0}}>
                                                                <tr>
                                                                    <th style={{"padding":"6px","textAlign":"left"}}>Date</th>
                                                                    <th style={{"padding":"6px","textAlign":"left"}}>Profile</th>
                                                                    <th style={{"padding":"6px","textAlign":"center"}}>Link</th>
                                                                    <th style={{"padding":"6px","textAlign":"left"}}>Email</th>
                                                                    <th style={{"padding":"6px","textAlign":"center"}}>
                                                                    </th>
                                                                    <th style={{"padding":"6px","textAlign":"center"}}>
                                                                    </th>
                                                                    <th style={{"padding":"6px","textAlign":"center"}}>
                                                                    </th>
                                                                    <th style={{"padding":"6px","textAlign":"center"}}>
                                                                    </th>
                                                                    <th style={{"padding":"6px","textAlign":"center"}}>
                                                                    </th>
                                                                    <th style={{"padding":"6px","textAlign":"center"}}>Status</th>
                                                                    <th style={{"padding":"6px","textAlign":"center"}}>Posts</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody id="import-history-table-body">
                                                                <tr>
                                                                    <td colSpan={11} style={{"padding":"20px","textAlign":"center","color":"#999"}}> No import actions yet. Start automation to see history here. </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
        </>
    );
}
