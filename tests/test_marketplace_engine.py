"""
Pytest unit tests for Federated GPU Marketplace & Workload Allocation Engine.
Verifies:
1. get_marketplace_inventory
2. allocate_workload multi-objective allocation
"""

import pytest
from backend.app.services.marketplace_engine import (
    get_marketplace_inventory,
    allocate_workload,
    WorkloadAllocationRequest,
    WorkloadAllocationResponse,
)

def test_get_marketplace_inventory():
    inv = get_marketplace_inventory()
    assert isinstance(inv, list)
    assert len(inv) > 0
    node = inv[0]
    assert "node_id" in node
    assert "gpu_model" in node
    assert "free_available_gpus" in node

def test_allocate_workload_training():
    req = WorkloadAllocationRequest(
        workload_type="PRE_TRAINING",
        gpu_model_preference="NVIDIA_H100_SXM",
        quantity_gpus=64,
        duration_hours=72,
    )
    res = allocate_workload(req)
    assert isinstance(res, WorkloadAllocationResponse)
    assert res.success is True
    assert res.quantity_requested == 64
    assert res.total_cost_inr > 0.0
    assert len(res.allocations) > 0
    assert res.savings_pct >= 0.0
