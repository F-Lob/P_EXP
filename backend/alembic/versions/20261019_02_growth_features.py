"""Add onboarding, budgets and saving goals."""

from alembic import op
import sqlalchemy as sa


revision = "20261019_02"
down_revision = "20261019_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("usuarios", sa.Column("dia_pago", sa.Integer(), nullable=True))
    op.add_column(
        "usuarios",
        sa.Column("onboarding_completado", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column("categorias", sa.Column("presupuesto_mensual", sa.Numeric(12, 2), nullable=True))
    op.create_table(
        "metas_ahorro",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nombre", sa.String(), nullable=False),
        sa.Column("monto_objetivo", sa.Numeric(12, 2), nullable=False),
        sa.Column("monto_ahorrado", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("fecha_objetivo", sa.DateTime(), nullable=True),
        sa.Column("usuario_id", sa.Integer(), sa.ForeignKey("usuarios.id"), nullable=False),
    )
    op.create_index("ix_metas_ahorro_id", "metas_ahorro", ["id"])


def downgrade() -> None:
    op.drop_index("ix_metas_ahorro_id", table_name="metas_ahorro")
    op.drop_table("metas_ahorro")
    op.drop_column("categorias", "presupuesto_mensual")
    op.drop_column("usuarios", "onboarding_completado")
    op.drop_column("usuarios", "dia_pago")
