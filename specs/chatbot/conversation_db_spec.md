# Conversation Database Specification - AI Todo Chatbot

## Overview
This specification defines the database schema for storing conversations and messages in the AI Todo Chatbot system. The schema uses SQLModel for integration with the existing FastAPI backend.

## Database Technology
- **Database Type**: PostgreSQL (compatible with existing backend)
- **ORM**: SQLModel (integration with FastAPI + Pydantic ecosystem)
- **Connection Pooling**: Managed by SQLAlchemy
- **Migration Tool**: Alembic for schema versioning

## Table Definitions

### 1. conversations Table
Stores high-level conversation metadata.

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB
);
```

**Fields**:
- `id`: Unique identifier for the conversation (UUID)
- `user_id`: Foreign key reference to user (indexed)
- `title`: Auto-generated or user-defined conversation title
- `created_at`: Timestamp when conversation was created
- `updated_at`: Timestamp of last activity in conversation
- `is_active`: Boolean indicating if conversation is active
- `metadata`: JSONB field for additional conversation metadata

**Indexes**:
- `idx_conversations_user_id`: Index on user_id for fast user lookups
- `idx_conversations_updated_at`: Index on updated_at for chronological sorting
- `idx_conversations_active`: Composite index on (user_id, is_active) for active conversation queries

**Constraints**:
- `fk_conversations_user`: Foreign key constraint linking to users table
- `check_user_id_not_empty`: Ensures user_id is not empty

### 2. messages Table
Stores individual messages within conversations.

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    tool_call_results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    parent_message_id UUID REFERENCES messages(id),
    metadata JSONB
);
```

**Fields**:
- `id`: Unique identifier for the message (UUID)
- `conversation_id`: Foreign key reference to conversation
- `user_id`: Reference to user who sent the message
- `role`: Message role ('user', 'assistant', 'system')
- `content`: Text content of the message
- `tool_calls`: JSONB field storing tool calls made by assistant
- `tool_call_results`: JSONB field storing results of tool executions
- `created_at`: Timestamp when message was created
- `updated_at`: Timestamp of last message update
- `parent_message_id`: Reference to parent message for threading
- `metadata`: Additional message metadata in JSONB format

**Indexes**:
- `idx_messages_conversation_id`: Index on conversation_id for conversation lookups
- `idx_messages_user_id`: Index on user_id for user-specific queries
- `idx_messages_created_at`: Index on created_at for chronological ordering
- `idx_messages_role`: Index on role for filtering by message type

**Constraints**:
- `fk_messages_conversation`: Foreign key constraint linking to conversations table
- `fk_messages_parent`: Self-referencing foreign key for parent message
- `check_role_valid`: Ensures role is one of allowed values
- `check_content_not_empty`: Ensures content is not empty for user messages

## SQLModel Classes

### Conversation Model
```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
import uuid
from datetime import datetime

class ConversationBase(SQLModel):
    title: Optional[str] = Field(max_length=255)
    is_active: bool = Field(default=True)
    metadata: Optional[dict] = Field(default=None, sa_column_kwargs={"server_default": "{}"})

class Conversation(ConversationBase, table=True):
    __tablename__ = "conversations"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        sa_column_kwargs={"server_default": "gen_random_uuid()"}
    )
    user_id: str = Field(index=True, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    messages: List["Message"] = Relationship(back_populates="conversation")

class ConversationRead(ConversationBase):
    id: uuid.UUID
    user_id: str
    created_at: datetime
    updated_at: datetime
```

### Message Model
```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime

class MessageBase(SQLModel):
    role: str = Field(regex=r"^(user|assistant|system)$")
    content: str = Field(min_length=1)
    tool_calls: Optional[List[Dict[str, Any]]] = Field(default=None)
    tool_call_results: Optional[List[Dict[str, Any]]] = Field(default=None)
    metadata: Optional[Dict[str, Any]] = Field(default=None)

class Message(MessageBase, table=True):
    __tablename__ = "messages"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        sa_column_kwargs={"server_default": "gen_random_uuid()"}
    )
    conversation_id: uuid.UUID = Field(foreign_key="conversations.id", index=True)
    user_id: str = Field(index=True, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    parent_message_id: Optional[uuid.UUID] = Field(default=None, foreign_key="messages.id")

    # Relationships
    conversation: "Conversation" = Relationship(back_populates="messages")
    parent_message: Optional["Message"] = Relationship(
        back_populates="replies",
        sa_relationship_kwargs={"remote_side": "Message.id"}
    )
    replies: List["Message"] = Relationship(back_populates="parent_message")

class MessageRead(MessageBase):
    id: uuid.UUID
    conversation_id: uuid.UUID
    user_id: str
    created_at: datetime
    updated_at: datetime
    parent_message_id: Optional[uuid.UUID] = None
```

## Database Operations

### Conversation Operations
- **Create**: Insert new conversation record
- **Retrieve**: Query by user_id and optionally filter by active status
- **Update**: Modify title or active status, update timestamp
- **Delete**: Soft delete by setting is_active to false (hard delete option available)

### Message Operations
- **Create**: Insert new message with conversation association
- **Retrieve**: Query by conversation_id with optional role filtering
- **Update**: Modify content or metadata, update timestamp
- **Delete**: Remove message (with cascade option for child messages)

## Indexing Strategy

### Primary Indexes
- Conversations: Primary key on id, index on user_id
- Messages: Primary key on id, indexes on conversation_id, user_id

### Secondary Indexes
- Time-based queries: Index on created_at for both tables
- Role-based queries: Index on message role for filtering
- Active conversations: Composite index on (user_id, is_active)

## Data Retention Policy

### Conversation Archival
- Automatic archival of inactive conversations after 90 days
- Archived conversations remain accessible but are moved to cold storage
- Deletion of conversations after 2 years of inactivity

### Message Retention
- Messages tied to conversation retention policy
- Audit trail preserved separately for compliance

## Performance Optimization

### Query Optimization
- Use EXPLAIN ANALYZE for complex queries
- Implement connection pooling
- Cache frequently accessed conversation metadata

### Partitioning Strategy
- Partition messages table by date if needed for large datasets
- Consider conversation-based partitioning for very high-volume applications

## Security Considerations

### Data Encryption
- Transparent data encryption for data at rest
- TLS encryption for data in transit
- Application-level encryption for sensitive message content

### Access Controls
- Row-level security based on user_id
- Parameterized queries to prevent SQL injection
- Regular security audits of database access patterns

## Backup & Recovery

### Backup Strategy
- Daily full backups with transaction log shipping
- Point-in-time recovery capability
- Offsite backup storage for disaster recovery

### Recovery Procedures
- Automated backup verification
- Regular recovery testing procedures
- Documented recovery time objectives (RTO) and recovery point objectives (RPO)

## Migration Strategy
- Use Alembic for database schema migrations
- Implement backward-compatible changes where possible
- Plan for zero-downtime deployments
- Include rollback procedures for each migration