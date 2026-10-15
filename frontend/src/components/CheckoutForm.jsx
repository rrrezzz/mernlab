import React from "react";
import { User, Phone, MapPin, Building2, Landmark, Hash } from "lucide-react";

const CheckoutForm = ({ values, errors, onChange, disabled }) => {
  const fields = [
    { name: "fullName", label: "Full Name", placeholder: "Aarav Sharma", icon: User },
    { name: "phone", label: "Phone", placeholder: "9876543210", icon: Phone },
    { name: "addressLine1", label: "Address", placeholder: "22 MG Road", icon: MapPin },
    { name: "city", label: "City", placeholder: "Bengaluru", icon: Building2 },
    { name: "state", label: "State", placeholder: "Karnataka", icon: Landmark },
    { name: "pincode", label: "Pincode", placeholder: "560001", icon: Hash },
  ];

  return (
    <div className="checkout-form-card" data-testid="checkout-form">
      <h2 className="summary-title">Shipping Details</h2>
      <form className="auth-form checkout-form" onSubmit={(e) => e.preventDefault()}>
        {fields.map(({ name, label, placeholder, icon: Icon }) => (
          <div className="form-group" key={name}>
            <label className="form-label" htmlFor={`checkout-${name}`}>
              {label}
              <span className="required-star">*</span>
            </label>
            <div className={`input-wrapper ${errors[name] ? "has-error" : ""}`}>
              <Icon size={15} className="input-icon" />
              <input
                id={`checkout-${name}`}
                name={name}
                type="text"
                className="form-input"
                placeholder={placeholder}
                value={values[name]}
                onChange={onChange}
                disabled={disabled}
                autoComplete="off"
              />
            </div>
            {errors[name] && <p className="field-error-text">{errors[name]}</p>}
          </div>
        ))}
      </form>
    </div>
  );
};

export default CheckoutForm;
