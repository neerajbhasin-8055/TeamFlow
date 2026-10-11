
import { useState } from "react";
import formConfig from "../config/EntityFormConfig"

function CreateEntityModal({ entityType, onClose, onSuccess }) {
  const fields = formConfig[entityType];

  const initialFormData = Object.fromEntries(
    fields.map((field) => [field.name, ""])
  );

  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSuccess(formData);
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!fields) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold capitalize text-gray-900">
            Create {entityType}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-800"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                {field.label}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  minLength={field.minLength}
                  maxLength={field.maxLength}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              ) : field.type === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                >
                  <option value="">Select {field.label}</option>

                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  minLength={field.minLength}
                  maxLength={field.maxLength}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              )}
            </div>
          ))}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : `Create ${entityType}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEntityModal;
