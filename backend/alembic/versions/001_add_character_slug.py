"""Add slug field to IslamicCharacter model

Revision ID: 001
Revises: 
Create Date: 2024-01-18 08:35:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '001_add_character_slug'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Add slug field to islamic_characters table"""
    # Add slug column
    op.add_column('islamic_characters', sa.Column('slug', sa.String(length=200), nullable=True, unique=True))
    
    # Create index for slug
    op.create_index('islamic_characters', ['slug'], unique=True, name='ix_islamic_characters_slug')
    
    # Populate slug field for existing records
    connection = op.get_bind()
    
    # Update existing records with slugs
    slugs = {
        1: 'muhammad',
        2: 'abu-bakr',
        3: 'umar',
        4: 'uthman',
        5: 'ali'
    }
    
    for character_id, slug in slugs.items():
        connection.execute(
            sa.text("UPDATE islamic_characters SET slug = :slug WHERE id = :id"),
            {'slug': slug, 'id': character_id}
        )
    
    # Make slug not nullable after populating
    op.alter_column('islamic_characters', sa.Column('slug', sa.String(length=200), nullable=False, unique=True))


def downgrade():
    """Remove slug field from islamic_characters table"""
    # Remove index
    op.drop_index('ix_islamic_characters_slug', table_name='islamic_characters')
    
    # Remove column
    op.drop_column('islamic_characters', 'slug')
