'use client';
import React from 'react';
import { IconBot, IconChart, IconDownload, IconRefresh, IconTrash, IconUser, IconUsers, IconZap } from './Icons';

export default function AnalyticsTab() {
    return (
        <>
            {/* TAB CONTENT: ANALYTICS */} {/* Combined Engagement Analytics Card */}
            <div className="card" style={{"padding":"12px"}}>
                <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"12px","marginBottom":"12px"}}>
                    <h4 style={{"margin":0,"fontSize":"14px","fontWeight":600,"color":"#693fe9"}}>
                        <IconChart size={14} /> Engagement Analytics</h4>
                        <div style={{"display":"flex","alignItems":"center","gap":"8px"}}>
                            <select id="analytics-period" style={{"padding":"5px 8px","fontSize":"11px","border":"1.5px solid #e0e0e0","borderRadius":"4px","minWidth":"110px"}}>
                                <option value="0">Today</option>
                                <option value="1">Yesterday</option>
                                <option value="3">Last 3 Days</option>
                                <option value="7">Last 7 Days</option>
                                <option value="30">Last 30 Days</option>
                                <option value="90">Last 90 Days</option>
                            </select>
                            <button className="action-button" id="refresh-analytics" style={{"padding":"5px 10px","fontSize":"11px","minWidth":"auto"}}>
                                <IconRefresh size={14} />
                            </button>
                        </div>
                    </div>
                    <div className="stats-grid" style={{"gridTemplateColumns":"repeat(5, 1fr)","gap":"8px"}}>
                        <div className="stat-item" style={{"padding":"10px","textAlign":"center","background":"linear-gradient(135deg, #693fe9 0%, #7c4dff 100%)","borderRadius":"8px","boxShadow":"0 2px 8px rgba(105, 63, 233, 0.3)"}}>
                            <span className="stat-value" id="total-engagements" style={{"fontSize":"22px","color":"white","fontWeight":700}}>0</span>
                            <span className="stat-label" style={{"fontSize":"10px","color":"rgba(255,255,255,0.9)"}}>Total</span>
                        </div>
                        <div className="stat-item" style={{"padding":"10px","textAlign":"center","background":"linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)","borderRadius":"8px","boxShadow":"0 2px 8px rgba(76, 175, 80, 0.3)"}}>
                            <span className="stat-value" id="total-comments" style={{"fontSize":"18px","color":"white","fontWeight":600}}>0</span>
                            <span className="stat-label" style={{"fontSize":"10px","color":"rgba(255,255,255,0.9)"}}>Comments</span>
                        </div>
                        <div className="stat-item" style={{"padding":"10px","textAlign":"center","background":"linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)","borderRadius":"8px","boxShadow":"0 2px 8px rgba(33, 150, 243, 0.3)"}}>
                            <span className="stat-value" id="total-likes" style={{"fontSize":"18px","color":"white","fontWeight":600}}>0</span>
                            <span className="stat-label" style={{"fontSize":"10px","color":"rgba(255,255,255,0.9)"}}>Likes</span>
                        </div>
                        <div className="stat-item" style={{"padding":"10px","textAlign":"center","background":"linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)","borderRadius":"8px","boxShadow":"0 2px 8px rgba(255, 152, 0, 0.3)"}}>
                            <span className="stat-value" id="total-shares" style={{"fontSize":"18px","color":"white","fontWeight":600}}>0</span>
                            <span className="stat-label" style={{"fontSize":"10px","color":"rgba(255,255,255,0.9)"}}>Shares</span>
                        </div>
                        <div className="stat-item" style={{"padding":"10px","textAlign":"center","background":"linear-gradient(135deg, #E91E63 0%, #F06292 100%)","borderRadius":"8px","boxShadow":"0 2px 8px rgba(233, 30, 99, 0.3)"}}>
                            <span className="stat-value" id="total-posts" style={{"fontSize":"18px","color":"white","fontWeight":600}}>0</span>
                            <span className="stat-label" style={{"fontSize":"10px","color":"rgba(255,255,255,0.9)"}}>Posts</span>
                        </div>
                    </div>
                </div>
                {/* Leads Database Section */}
                <div className="card" style={{"padding":"12px"}}>
                    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"10px"}}>
                        <h4 style={{"margin":0,"fontSize":"13px"}}>
                            <IconUsers size={14} /> Leads Database</h4>
                            <div style={{"display":"flex","gap":"6px","alignItems":"center"}}>
                                <button className="action-button" id="refresh-leads" style={{"padding":"4px 10px","fontSize":"11px"}}>
                                    <IconRefresh size={14} />
                                </button>
                                <select id="leads-filter-query" style={{"padding":"4px 8px","fontSize":"11px","minWidth":"100px"}}>
                                    <option value="all">All Queries</option>
                                </select>
                                <button className="action-button secondary" id="export-leads" style={{"padding":"4px 10px","fontSize":"11px"}}>
                                    <IconDownload size={14} />
                                </button>
                                <button className="action-button" id="clear-all-leads" style={{"padding":"4px 10px","fontSize":"11px","background":"#dc3545","borderColor":"#dc3545"}} title="Clear all leads">
                                    <IconTrash size={14} />
                                </button>
                            </div>
                        </div>
                        <div style={{"display":"flex","alignItems":"center","gap":"12px","marginBottom":"8px"}}>
                            <label style={{"display":"flex","alignItems":"center","gap":"4px","fontSize":"11px","cursor":"pointer"}}>
                                <input type="checkbox" id="show-contact-info" style={{"cursor":"pointer"}} />
                                <span>Show Email & Phone</span>
                            </label>
                        </div>
                        <input type="text" id="leads-search" placeholder=" Search leads..." style={{"width":"100%","padding":"6px 10px","fontSize":"11px","marginBottom":"8px","border":"1px solid #e0e0e0","borderRadius":"4px"}} />
                        <div id="leads-stats" style={{"display":"flex","gap":"12px","marginBottom":"8px","fontSize":"11px","color":"#6c757d"}}>
                            <span>Total: <strong id="total-leads-count">0</strong>
                        </span>
                        <span>Email: <strong id="leads-with-email">0</strong>
                    </span>
                    <span>Phone: <strong id="leads-with-phone">0</strong>
                </span>
                <span>Connected: <strong id="leads-connected">0</strong>
            </span>
        </div>
        <div id="leads-table" style={{"maxHeight":"400px","overflowY":"auto","border":"1px solid #dee2e6","borderRadius":"5px"}}>
            <table style={{"width":"100%","fontSize":"12px","borderCollapse":"collapse"}}>
                <thead style={{"background":"#693fe9","color":"white","position":"sticky","top":0}}>
                    <tr>
                        <th style={{"padding":"8px","textAlign":"left"}}>Name</th>
                        <th style={{"padding":"8px","textAlign":"left"}}>Headline</th>
                        <th style={{"padding":"8px","textAlign":"left"}}>Location</th>
                        <th className="contact-column" style={{"padding":"8px","textAlign":"left","display":"block"}}>Email</th>
                        <th className="contact-column" style={{"padding":"8px","textAlign":"left","display":"block"}}>Phone</th>
                        <th style={{"padding":"8px","textAlign":"left"}}>Query</th>
                        <th style={{"padding":"8px","textAlign":"left"}}>Date</th>
                        <th style={{"padding":"8px","textAlign":"center"}}>Actions</th>
                    </tr>
                </thead>
                <tbody id="leads-table-body">
                    <tr>
                        <td colSpan={8} style={{"padding":"20px","textAlign":"center","color":"#6c757d"}}> No leads found. Start a People Search to collect leads.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    {/* Automation History Section */}
    <div className="card" style={{"padding":"12px"}}>
        <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"10px"}}>
            <h4 style={{"margin":0,"fontSize":"13px"}}>
                <IconBot size={14} /> Automation History</h4>
                <div style={{"display":"flex","gap":"6px"}}>
                    <select id="automation-history-filter-status" style={{"padding":"4px 8px","fontSize":"11px"}}>
                        <option value="all">All</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                    </select>
                    <button className="action-button" id="refresh-automation-history" style={{"padding":"4px 10px","fontSize":"11px"}}>
                        <IconRefresh size={14} />
                    </button>
                    <button className="action-button secondary" id="export-automation-history" style={{"padding":"4px 10px","fontSize":"11px"}}>
                        <IconDownload size={14} />
                    </button>
                    <button className="action-button secondary" id="clear-automation-history" style={{"padding":"4px 10px","fontSize":"11px"}}>
                        <IconTrash size={14} />
                    </button>
                </div>
            </div>
            <input type="text" id="automation-search" placeholder=" Search by keyword, author..." style={{"width":"100%","padding":"6px 10px","fontSize":"11px","marginBottom":"8px","border":"1px solid #e0e0e0","borderRadius":"4px"}} />
            <div id="automation-history-stats" style={{"display":"flex","gap":"12px","marginBottom":"8px","fontSize":"11px","color":"#6c757d"}}>
                <span>Sessions: <strong id="automation-total-sessions">0</strong>
            </span>
            <span>Posts: <strong id="automation-posts-processed">0</strong>
        </span>
        <span>Comments: <strong id="automation-comments-generated">0</strong>
    </span>
    <span>Rate: <strong id="automation-success-rate">0%</strong>
</span>
</div>
<div id="automation-history-table" style={{"maxHeight":"400px","overflowY":"auto","border":"1px solid #dee2e6","borderRadius":"5px"}}>
    <table style={{"width":"100%","fontSize":"11px","borderCollapse":"collapse"}}>
        <thead style={{"background":"linear-gradient(135deg, #693fe9 0%, #7c4dff 100%)","color":"white","position":"sticky","top":0}}>
            <tr>
                <th style={{"padding":"8px","textAlign":"left","borderBottom":"2px solid #dee2e6"}}>Keywords</th>
                <th style={{"padding":"8px","textAlign":"left","borderBottom":"2px solid #dee2e6"}}>Author</th>
                <th style={{"padding":"8px","textAlign":"left","borderBottom":"2px solid #dee2e6","maxWidth":"200px"}}>Post Content</th>
                <th style={{"padding":"8px","textAlign":"left","borderBottom":"2px solid #dee2e6","maxWidth":"200px"}}>Generated Comment</th>
                <th style={{"padding":"8px","textAlign":"center","borderBottom":"2px solid #dee2e6"}}>Actions</th>
                <th style={{"padding":"8px","textAlign":"center","borderBottom":"2px solid #dee2e6"}}>Status</th>
                <th style={{"padding":"8px","textAlign":"left","borderBottom":"2px solid #dee2e6"}}>Date</th>
                <th style={{"padding":"8px","textAlign":"center","borderBottom":"2px solid #dee2e6"}}>Delete</th>
            </tr>
        </thead>
        <tbody id="automation-history-table-body">
            <tr>
                <td colSpan={8} style={{"padding":"20px","textAlign":"center","color":"#6c757d"}}> No automation history found. Start Bulk Processing to see post details here. </td>
            </tr>
        </tbody>
    </table>
</div>
</div>
{/* Networking History Section */}
<div className="card" style={{"padding":"12px"}}>
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"10px"}}>
        <h4 style={{"margin":0,"fontSize":"13px"}}>
            <IconUsers size={14} /> Networking History</h4>
            <div style={{"display":"flex","gap":"6px"}}>
                <select id="networking-history-filter-status" style={{"padding":"4px 8px","fontSize":"11px"}}>
                    <option value="all">All</option>
                    <option value="completed">Done</option>
                    <option value="stopped">Stopped</option>
                    <option value="failed">Failed</option>
                </select>
                <button className="action-button" id="refresh-networking-history" style={{"padding":"4px 10px","fontSize":"11px"}}>
                    <IconRefresh size={14} />
                </button>
                <button className="action-button secondary" id="export-networking-history" style={{"padding":"4px 10px","fontSize":"11px"}}>
                    <IconDownload size={14} />
                </button>
                <button className="action-button secondary" id="clear-networking-history" style={{"padding":"4px 10px","fontSize":"11px"}}>
                    <IconTrash size={14} />
                </button>
            </div>
        </div>
        <input type="text" id="networking-search" placeholder=" Search by query..." style={{"width":"100%","padding":"6px 10px","fontSize":"11px","marginBottom":"8px","border":"1px solid #e0e0e0","borderRadius":"4px"}} />
        <div id="networking-history-stats" style={{"display":"flex","gap":"12px","marginBottom":"8px","fontSize":"11px","color":"#6c757d"}}>
            <span>Sessions: <strong id="networking-total-sessions">0</strong>
        </span>
        <span>Sent: <strong id="networking-connections-sent">0</strong>
    </span>
    <span>Found: <strong id="networking-profiles-found">0</strong>
</span>
<span>Rate: <strong id="networking-success-rate">0%</strong>
</span>
</div>
<div id="networking-history-table" style={{"maxHeight":"400px","overflowY":"auto","border":"1px solid #dee2e6","borderRadius":"5px"}}>
    <table style={{"width":"100%","fontSize":"11px","borderCollapse":"collapse"}}>
        <thead style={{"background":"linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)","color":"white","position":"sticky","top":0}}>
            <tr>
                <th style={{"padding":"8px","textAlign":"left","borderBottom":"2px solid #dee2e6"}}>Search Query</th>
                <th style={{"padding":"8px","textAlign":"center","borderBottom":"2px solid #dee2e6"}}>Target</th>
                <th style={{"padding":"8px","textAlign":"center","borderBottom":"2px solid #dee2e6"}}>Found</th>
                <th style={{"padding":"8px","textAlign":"center","borderBottom":"2px solid #dee2e6"}}>Sent</th>
                <th style={{"padding":"8px","textAlign":"center","borderBottom":"2px solid #dee2e6"}}>Success Rate</th>
                <th style={{"padding":"8px","textAlign":"center","borderBottom":"2px solid #dee2e6"}}>Duration</th>
                <th style={{"padding":"8px","textAlign":"center","borderBottom":"2px solid #dee2e6"}}>Status</th>
                <th style={{"padding":"8px","textAlign":"left","borderBottom":"2px solid #dee2e6"}}>Date</th>
                <th style={{"padding":"8px","textAlign":"center","borderBottom":"2px solid #dee2e6"}}>Actions</th>
            </tr>
        </thead>
        <tbody id="networking-history-table-body">
            <tr>
                <td colSpan={9} style={{"padding":"20px","textAlign":"center","color":"#6c757d"}}> No networking history found. Start People Search to see history here. </td>
            </tr>
        </tbody>
    </table>
</div>
</div>
<div className="card">
    <button className="action-button" id="export-stats">
        <IconDownload size={14} /> Export Statistics</button>
        <button className="action-button secondary" id="clear-stats">
            <IconTrash size={14} /> Clear All Data</button>
        </div>
        </>
    );
}
