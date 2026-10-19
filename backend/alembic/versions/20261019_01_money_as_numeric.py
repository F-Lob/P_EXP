"""Store monetary amounts as numeric values instead of floating point."""

from alembic import op
import sqlalchemy as sa


revision = "20261019_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    for table, column in (("gastos", "monto"), ("gastos_tarjeta", "monto_total"), ("sueldo", "monto")):
        op.alter_column(
            table,
            column,
            existing_type=sa.Float(),
            type_=sa.Numeric(12, 2),
            postgresql_using=f"{column}::numeric(12,2)",
        )


def downgrade() -> None:
    for table, column in (("gastos", "monto"), ("gastos_tarjeta", "monto_total"), ("sueldo", "monto")):
        op.alter_column(table, column, existing_type=sa.Numeric(12, 2), type_=sa.Float())
