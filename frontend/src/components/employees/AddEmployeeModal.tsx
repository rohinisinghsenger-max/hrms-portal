import { useState } from 'react';
import { useForm } from '../hooks/useForm';
import { employeeApi } from '../../api/employees';
import { Modal } from '../ui/Modal';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';
import type { EmployeeCreate } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEPARTMENTS = [
  'Engineering', 'Product', 'Design', 'Marketing', 'Sales',
  'Finance', 'HR', 'Operations', 'Legal', 'Customer Support',
];

const initialValues: EmployeeCreate = {
  employee_id: '',
  full_name: '',
  email: '',
  department: '',
  position: '',
  phone: '',
};

export function AddEmployeeModal({ open, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const validate = (values: EmployeeCreate) => {
    const errs: Partial<Record<keyof EmployeeCreate, string>> = {};
    if (!values.employee_id.trim()) errs.employee_id = 'Employee ID is required';
    if (!values.full_name.trim()) errs.full_name = 'Full name is required';
    else if (values.full_name.trim().length < 2) errs.full_name = 'At least 2 characters';
    if (!values.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errs.email = 'Invalid email address';
    if (!values.department) errs.department = 'Department is required';
    return errs;
  };

  const { values, errors, handleChange, handleBlur, handleSubmit, reset } = useForm<EmployeeCreate>({
    initialValues,
    validate,
    onSubmit: async (data) => {
      setLoading(true);
      try {
        await employeeApi.create(data);
        toast.success(`Employee ${data.full_name} added successfully!`);
        reset();
        onSuccess();
        onClose();
      } catch (err) {
        toast.error((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleClose = () => {
    if (!loading) {
      reset();
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add New Employee"
      description="Fill in the details to create a new employee record."
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Employee ID */}
          <div>
            <label className="form-label">Employee ID <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="employee_id"
              value={values.employee_id}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. EMP001"
              className={errors.employee_id ? 'form-input-error' : 'form-input'}
            />
            {errors.employee_id && <p className="form-error">{errors.employee_id}</p>}
          </div>

          {/* Full Name */}
          <div>
            <label className="form-label">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="full_name"
              value={values.full_name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Jane Doe"
              className={errors.full_name ? 'form-input-error' : 'form-input'}
            />
            {errors.full_name && <p className="form-error">{errors.full_name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="form-label">Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="jane@company.com"
              className={errors.email ? 'form-input-error' : 'form-input'}
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          {/* Department */}
          <div>
            <label className="form-label">Department <span className="text-red-500">*</span></label>
            <select
              name="department"
              value={values.department}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.department ? 'form-input-error' : 'form-input'}
            >
              <option value="">Select department…</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {errors.department && <p className="form-error">{errors.department}</p>}
          </div>

          {/* Position */}
          <div>
            <label className="form-label">Position <span className="text-gray-400 text-xs">(optional)</span></label>
            <input
              type="text"
              name="position"
              value={values.position ?? ''}
              onChange={handleChange}
              placeholder="e.g. Software Engineer"
              className="form-input"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="form-label">Phone <span className="text-gray-400 text-xs">(optional)</span></label>
            <input
              type="tel"
              name="phone"
              value={values.phone ?? ''}
              onChange={handleChange}
              placeholder="+1 555 0100"
              className="form-input"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button type="button" onClick={handleClose} disabled={loading} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading && <LoadingSpinner size="sm" />}
            Add Employee
          </button>
        </div>
      </form>
    </Modal>
  );
}
