from datetime import datetime
from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    company_name: str
    registration_number: str | None = None
    address: str | None = None
    # Company profile
    primary_trade: str | None = None
    phone: str | None = None
    avg_contract_size: float | None = None
    target_margin: float | None = None
    monthly_fixed_costs: float | None = None
    labour_model: str | None = None
    cash_reserves: float | None = None
    years_trading: float | None = None
    growth_goal: str | None = None
    main_constraint: str | None = None


class UpdateProfileRequest(BaseModel):
    name: str | None = None
    company_name: str | None = None
    registration_number: str | None = None
    address: str | None = None
    primary_trade: str | None = None
    phone: str | None = None
    avg_contract_size: float | None = None
    target_margin: float | None = None
    monthly_fixed_costs: float | None = None
    labour_model: str | None = None
    cash_reserves: float | None = None
    years_trading: float | None = None
    growth_goal: str | None = None
    main_constraint: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    company_name: str
    registration_number: str | None = None
    address: str | None = None
    created_at: datetime
    primary_trade: str | None = None
    phone: str | None = None
    avg_contract_size: float | None = None
    target_margin: float | None = None
    monthly_fixed_costs: float | None = None
    labour_model: str | None = None
    cash_reserves: float | None = None
    years_trading: float | None = None
    growth_goal: str | None = None
    main_constraint: str | None = None

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
