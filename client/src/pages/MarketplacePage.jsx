import React, { useState } from 'react';
import './MarketplacePage.css';

function MarketplacePage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="marketplace-container">
      <div className="marketplace-header">
        <div>
          <h1 className="marketplace-title">Community Marketplace</h1>
          <p className="marketplace-subtitle">Buy, sell, and trade with your neighbors</p>
        </div>
        <button className="marketplace-list-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="marketplace-button-icon"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          List Item
        </button>
      </div>

      <div className="marketplace-filters">
        <div className="marketplace-search">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="marketplace-search-icon"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="marketplace-search-input"
            placeholder="Search marketplace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="marketplace-filter-buttons">
          <button className="marketplace-filter-button">Filter</button>
          <button className="marketplace-filter-button">Sort</button>
        </div>
      </div>

      <div className="marketplace-tabs">
        <div className="marketplace-tabs-list">
          <button 
            className={`marketplace-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button 
            className={`marketplace-tab ${activeTab === 'sale' ? 'active' : ''}`}
            onClick={() => setActiveTab('sale')}
          >
            For Sale
          </button>
          <button 
            className={`marketplace-tab ${activeTab === 'free' ? 'active' : ''}`}
            onClick={() => setActiveTab('free')}
          >
            Free
          </button>
          <button 
            className={`marketplace-tab ${activeTab === 'wanted' ? 'active' : ''}`}
            onClick={() => setActiveTab('wanted')}
          >
            Wanted
          </button>
        </div>

        <div className="marketplace-tab-content">
          {activeTab === 'all' && (
            <div className="marketplace-grid">
              <div className="marketplace-item">
                <div className="marketplace-item-image">
                  <img src="/placeholder.svg?height=200&width=400" alt="Bicycle" />
                </div>
                <div className="marketplace-item-header">
                  <div className="marketplace-item-title">Mountain Bike</div>
                  <div className="marketplace-item-price">$120</div>
                </div>
                <div className="marketplace-item-location">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="marketplace-location-icon"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  0.5 miles away
                </div>
                <div className="marketplace-item-description">
                  Lightly used mountain bike in great condition. Perfect for trails and city riding.
                </div>
                <div className="marketplace-item-footer">
                  <button className="marketplace-contact-button">Contact Seller</button>
                </div>
              </div>

              <div className="marketplace-item">
                <div className="marketplace-item-image">
                  <img src="/placeholder.svg?height=200&width=400" alt="Bookshelf" />
                </div>
                <div className="marketplace-item-header">
                  <div className="marketplace-item-title">Wooden Bookshelf</div>
                  <div className="marketplace-item-price">$75</div>
                </div>
                <div className="marketplace-item-location">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="marketplace-location-icon"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  1.2 miles away
                </div>
                <div className="marketplace-item-description">
                  Solid wood bookshelf with 5 shelves. Minor scratches but sturdy and functional.
                </div>
                <div className="marketplace-item-footer">
                  <button className="marketplace-contact-button">Contact Seller</button>
                </div>
              </div>

              <div className="marketplace-item">
                <div className="marketplace-item-image">
                  <img src="/placeholder.svg?height=200&width=400" alt="Plants" />
                </div>
                <div className="marketplace-item-header">
                  <div className="marketplace-item-title">Houseplants</div>
                  <div className="marketplace-item-free">FREE</div>
                </div>
                <div className="marketplace-item-location">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="marketplace-location-icon"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  0.3 miles away
                </div>
                <div className="marketplace-item-description">
                  Various healthy houseplants looking for a new home. Moving and can't take them with me.
                </div>
                <div className="marketplace-item-footer">
                  <button className="marketplace-contact-button">Contact Giver</button>
                </div>
              </div>

              <div className="marketplace-item">
                <div className="marketplace-item-image">
                  <img src="/placeholder.svg?height=200&width=400" alt="Desk" />
                </div>
                <div className="marketplace-item-header">
                  <div className="marketplace-item-title">Standing Desk</div>
                  <div className="marketplace-item-price">$200</div>
                </div>
                <div className="marketplace-item-location">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="marketplace-location-icon"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  2.1 miles away
                </div>
                <div className="marketplace-item-description">
                  Adjustable standing desk in excellent condition. Electric height adjustment, memory settings.
                </div>
                <div className="marketplace-item-footer">
                  <button className="marketplace-contact-button">Contact Seller</button>
                </div>
              </div>

              <div className="marketplace-item">
                <div className="marketplace-item-image wanted">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="marketplace-wanted-icon"
                  >
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                  </svg>
                </div>
                <div className="marketplace-item-header">
                  <div className="marketplace-item-title">Lawn Mower Wanted</div>
                  <div className="marketplace-item-wanted">WANTED</div>
                </div>
                <div className="marketplace-item-location">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="marketplace-location-icon"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  1.5 miles radius
                </div>
                <div className="marketplace-item-description">
                  Looking for a used lawn mower in good working condition. Willing to pay up to $100.
                </div>
                <div className="marketplace-item-footer">
                  <button className="marketplace-contact-button">Contact Buyer</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sale' && (
            <div className="marketplace-grid">
              <div className="marketplace-item">
                <div className="marketplace-item-image">
                  <img src="/placeholder.svg?height=200&width=400" alt="Bicycle" />
                </div>
                <div className="marketplace-item-header">
                  <div className="marketplace-item-title">Mountain Bike</div>
                  <div className="marketplace-item-price">$120</div>
                </div>
                <div className="marketplace-item-location">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="marketplace-location-icon"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  0.5 miles away
                </div>
                <div className="marketplace-item-description">
                  Lightly used mountain bike in great condition. Perfect for trails and city riding.
                </div>
                <div className="marketplace-item-footer">
                  <button className="marketplace-contact-button">Contact Seller</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'free' && (
            <div className="marketplace-grid">
              <div className="marketplace-item">
                <div className="marketplace-item-image">
                  <img src="/placeholder.svg?height=200&width=400" alt="Plants" />
                </div>
                <div className="marketplace-item-header">
                  <div className="marketplace-item-title">Houseplants</div>
                  <div className="marketplace-item-free">FREE</div>
                </div>
                <div className="marketplace-item-location">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="marketplace-location-icon"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  0.3 miles away
                </div>
                <div className="marketplace-item-description">
                  Various healthy houseplants looking for a new home. Moving and can't take them with me.
                </div>
                <div className="marketplace-item-footer">
                  <button className="marketplace-contact-button">Contact Giver</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wanted' && (
            <div className="marketplace-grid">
              <div className="marketplace-item">
                <div className="marketplace-item-image wanted">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="marketplace-wanted-icon"
                  >
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                  </svg>
                </div>
                <div className="marketplace-item-header">
                  <div className="marketplace-item-title">Lawn Mower Wanted</div>
                  <div className="marketplace-item-wanted">WANTED</div>
                </div>
                <div className="marketplace-item-location">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="marketplace-location-icon"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  1.5 miles radius
                </div>
                <div className="marketplace-item-description">
                  Looking for a used lawn mower in good working condition. Willing to pay up to $100.
                </div>
                <div className="marketplace-item-footer">
                  <button className="marketplace-contact-button">Contact Buyer</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MarketplacePage;