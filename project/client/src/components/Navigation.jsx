import React from 'react'
import '../App.css'
import '../css/Navigation.css'

const Navigation = () => {
    return (
        <header className="add-page-header">
            <div className="header-content">
                <h1 className="logo">StickerStory</h1>
                <div className="header-right">
                    <button className="username-btn">Username</button>
                    <button className="nav-arrow-btn" aria-label="Navigate">
                        <span className="arrow-icon">→</span>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Navigation