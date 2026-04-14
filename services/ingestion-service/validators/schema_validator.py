"""
Schema Validator — ingestion-service
Validates incoming payloads against JSON Schema definitions 
before publishing to Kafka. Invalid records are routed to DLQ.
"""
import jsonschema
import structlog
from typing import Dict, Any, Tuple

logger = structlog.get_logger(__name__)

# ── Per-department schemas ──────────────────────────────────────
# In production, these would be loaded from the Schema Registry.
# For MVP, they are defined inline per entity_type.

SCHEMAS = {
    "water_meter_reading": {
        "type": "object",
        "required": ["meter_id", "volume_m3", "timestamp"],
        "properties": {
            "meter_id": {"type": "string"},
            "volume_m3": {"type": "number", "minimum": 0},
            "pressure_bar": {"type": "number"},
            "flow_rate": {"type": "number"},
            "timestamp": {"type": "string", "format": "date-time"},
        }
    },
    "traffic_counter": {
        "type": "object",
        "required": ["counter_id", "vehicle_count", "timestamp"],
        "properties": {
            "counter_id": {"type": "string"},
            "vehicle_count": {"type": "integer", "minimum": 0},
            "avg_speed_kmh": {"type": "number"},
            "road_segment_id": {"type": "string"},
            "timestamp": {"type": "string", "format": "date-time"},
        }
    },
    "finance_transaction": {
        "type": "object",
        "required": ["transaction_id", "amount", "currency"],
        "properties": {
            "transaction_id": {"type": "string"},
            "amount": {"type": "number"},
            "currency": {"type": "string", "enum": ["ILS", "USD", "EUR"]},
            "budget_line": {"type": "string"},
            "description": {"type": "string"},
        }
    }
}


def validate_payload(entity_type: str, data: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Validate a payload against its registered schema.
    Returns (is_valid, error_message).
    """
    schema = SCHEMAS.get(entity_type)
    if schema is None:
        # No schema registered — pass through (warn)
        logger.warning("no_schema_registered", entity_type=entity_type)
        return True, ""

    try:
        jsonschema.validate(instance=data, schema=schema)
        return True, ""
    except jsonschema.ValidationError as e:
        return False, str(e.message)
    except jsonschema.SchemaError as e:
        logger.error("schema_definition_error", entity_type=entity_type, error=str(e))
        return False, f"Schema definition error: {e.message}"
