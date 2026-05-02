import React from 'react'
import ReactMarkdown from 'react-markdown'

const ChatMessageBubble = ({ message }) => {
  if (message.role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <div style={{
          maxWidth: '75%',
          background: 'linear-gradient(135deg, #00B4D8, #0077B6)',
          borderRadius: '18px 18px 4px 18px',
          padding: '12px 16px',
          color: 'white',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'flex-start' }}>
      {/* AI Avatar */}
      <div style={{
        width: '32px', height: '32px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #00B4D8, #0077B6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: '14px'
      }}>🛡️</div>

      <div style={{ flex: 1, maxWidth: '85%' }}>
        {/* AI name */}
        <div style={{ color: '#9CA3AF', fontSize: '11px', marginBottom: '4px' }}>
          MediGuard AI • {new Date(message.timestamp).toLocaleTimeString()}
        </div>

        {/* Message bubble */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px 18px 18px 18px',
          padding: '14px 16px',
          fontSize: '14px',
          lineHeight: '1.6',
          color: 'var(--text-primary)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        }}>
          <ReactMarkdown
            components={{
              strong: ({ children }) => (
                <strong style={{ color: 'var(--primary)', fontWeight: '700' }}>{children}</strong>
              ),
              ul: ({ children }) => (
                <ul style={{ paddingLeft: '16px', margin: '8px 0' }}>{children}</ul>
              ),
              li: ({ children }) => (
                <li style={{ marginBottom: '4px', color: 'var(--text-primary)' }}>{children}</li>
              ),
              p: ({ children }) => (
                <p style={{ margin: '0 0 8px 0' }}>{children}</p>
              )
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Sources if available */}
        {message.sources?.length > 0 && (
          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ color: '#6B7280', fontSize: '11px', width: '100%' }}>
              🔍 Sources:
            </span>
            {message.sources.map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '4px 10px',
                  background: 'rgba(0,180,216,0.1)',
                  border: '1px solid rgba(0,180,216,0.2)',
                  borderRadius: '20px',
                  color: '#00B4D8',
                  fontSize: '11px',
                  textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                🌐 {source.title?.substring(0, 30)}...
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatMessageBubble
