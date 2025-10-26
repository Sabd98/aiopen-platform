export const RoleBadge: React.FC<{ role: string }> = ({ role }) => (
  <div className={role === 'user' ? 'text-right text-sm text-gray-500' : 'text-left text-sm text-gray-500'}>{role}</div>
);