/* eslint-disable no-unused-vars */
/**
 * SystemSettings.jsx
 * ------------------------------------------------------------------
 * Pure Tailwind CSS implementation — no Bootstrap.
 * ------------------------------------------------------------------
 */

import { useState, useEffect } from 'react';
import { FaCog, FaSave, FaUndo, FaShieldAlt, FaDatabase, FaServer, FaUsers, FaBell, FaKey, FaExclamationTriangle, FaSync, FaCloudUploadAlt, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from 'react-toastify';

import { useAuth } from '../../context/AuthContext';
import AdminPageShell from '../../components/admin/AdminPageShell';
import adminService from '../../services/adminService';
import cloudinaryService from '../../services/cloudinaryService';

/* ---------------- Tailwind UI primitives ---------------- */

const Button = ({ variant = 'primary', size = 'md', className = '', children, ...props }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    outlineSecondary: 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800',
    outlinePrimary: 'border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40',
    outlineWarning: 'border border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/40',
    outlineDanger: 'border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40',
  };
  const sizes = { sm: 'px-2 py-1 text-xs', md: 'px-3 py-2 text-sm', lg: 'px-4 py-2.5 text-base' };
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ className = '', children }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-700 ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 ${className}`}>{children}</div>
);

const CardBody = ({ children, className = '' }) => <div className={`p-4 ${className}`}>{children}</div>;

const Alert = ({ variant = 'info', children, className = '' }) => {
  const variants = {
    info: 'bg-cyan-50 border-cyan-200 text-cyan-800 dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-200',
    danger: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/40 dark:border-yellow-800 dark:text-yellow-200',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/40 dark:border-green-800 dark:text-green-200',
  };
  return <div className={`border rounded-md px-4 py-3 text-sm ${variants[variant]} ${className}`}>{children}</div>;
};

const Badge = ({ color = 'bg-gray-100 text-gray-800', children, className = '' }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color} ${className}`}>
    {children}
  </span>
);

const Spinner = () => (
  <div className="inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
);

const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 ${className}`}
    {...props}
  />
);

const Select = ({ className = '', children, ...props }) => (
  <select
    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 ${className}`}
    {...props}
  >
    {children}
  </select>
);

const Textarea = ({ className = '', ...props }) => (
  <textarea
    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 ${className}`}
    {...props}
  />
);

const Label = ({ children, className = '' }) => (
  <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${className}`}>{children}</label>
);

const Switch = ({ checked, onChange, label, id }) => (
  <label htmlFor={id} className="flex items-center gap-3 cursor-pointer py-1">
    <div className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}>
      <input id={id} type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </div>
    {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
  </label>
);

const Modal = ({ show, onHide, size = 'md', children }) => {
  if (!show) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-3xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onHide} />
      <div className={`relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        {children}
      </div>
    </div>
  );
};

const ModalHeader = ({ children, onClose }) => (
  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
    <h3 className="text-lg font-semibold text-gray-800">{children}</h3>
    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
  </div>
);

const ModalBody = ({ children }) => <div className="px-5 py-4">{children}</div>;

const ModalFooter = ({ children }) => (
  <div className="flex flex-wrap justify-end gap-2 px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
    {children}
  </div>
);

const Table = ({ children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">{children}</table>
  </div>
);

/* ---------------- Component ---------------- */

const SystemSettings = () => {
  const { currentUser, userProfile, isSuperAdmin } = useAuth();
  const hasSuperAdminAccess =
    isSuperAdmin === true ||
    userProfile?.isSuperAdmin === true ||
    ['super_admin', 'superadmin'].includes(String(userProfile?.userType || userProfile?.role || '').toLowerCase());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showResetModal, setShowResetModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);

  const [settings, setSettings] = useState({
    general: {
      siteName: 'Career Connect Lesotho',
      siteUrl: 'https://careerconnect-lesotho.web.app',
      adminEmail: 'admin@careerconnectlesotho.com',
      supportEmail: 'support@careerconnectlesotho.com',
      timezone: 'Africa/Maseru',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      maintenanceMode: false,
      enableRegistration: true,
      enableEmailVerification: true,
      defaultUserRole: 'student',
    },
    security: {
      requireStrongPasswords: true,
      passwordMinLength: 8,
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      sessionTimeout: 60,
      enable2FA: false,
      enableIPWhitelist: false,
      allowedIPs: [],
      enableRateLimiting: true,
      maxRequestsPerMinute: 100,
      enableSecurityHeaders: true,
      enableCORS: true,
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      smtpEncryption: 'tls',
      fromName: 'Career Connect Lesotho',
      fromEmail: 'noreply@careerconnectlesotho.com',
      enableEmailNotifications: true,
      emailVerificationTemplate: 'default',
      passwordResetTemplate: 'default',
      welcomeEmailTemplate: 'default',
    },
    storage: {
      maxFileSize: 10,
      allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'],
      maxUserStorage: 100,
      enableCompression: true,
      storageProvider: 'firebase',
      backupFrequency: 'daily',
      keepBackupsFor: 30,
      enableAutoCleanup: true,
    },
    api: {
      enableAPI: true,
      apiVersion: 'v1',
      apiRateLimit: 1000,
      requireApiKey: true,
      enableSwagger: true,
      enableWebhooks: true,
      webhookSecret: '',
      apiKeys: [],
    },
    analytics: {
      enableAnalytics: true,
      analyticsProvider: 'firebase',
      trackUserBehavior: true,
      trackPageViews: true,
      trackEvents: true,
      dataRetention: 365,
      enableGDPRCompliance: true,
      anonymizeIP: true,
    },
    notifications: {
      enablePushNotifications: true,
      enableEmailNotifications: true,
      enableSMSNotifications: false,
      notifyNewRegistrations: true,
      notifyFailedLogins: true,
      notifySystemErrors: true,
      notificationSound: true,
      desktopNotifications: false,
    },
  });

  const [newApiKey, setNewApiKey] = useState({ name: '', permissions: ['read'] });
  const [backupFile, setBackupFile] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await adminService.settings.getSystemSettings();
      if (response.success && response.data?.general) {
        setSettings((prev) => ({ ...prev, ...response.data }));
        localStorage.setItem('systemSettings', JSON.stringify(response.data));
        return;
      }
      const savedSettings = localStorage.getItem('systemSettings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      if (!validateSettings()) return;
      const response = await adminService.settings.updateSystemSettings(settings, currentUser, userProfile);
      if (!response.success) throw new Error(response.error || 'Failed to save settings');
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      toast.success('Settings saved to Firebase successfully');
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const validateSettings = () => {
    if (!settings.email.smtpHost || !settings.email.smtpPort) {
      toast.error('SMTP host and port are required');
      return false;
    }
    if (settings.api.enableAPI && !settings.api.apiVersion) {
      toast.error('API version is required when API is enabled');
      return false;
    }
    if (settings.storage.maxFileSize <= 0) {
      toast.error('Maximum file size must be greater than 0');
      return false;
    }
    return true;
  };

  const resetToDefaults = () => {
    setSettings({
      general: {
        siteName: 'Career Connect Lesotho',
        siteUrl: 'https://careerconnect-lesotho.web.app',
        adminEmail: 'admin@careerconnectlesotho.com',
        supportEmail: 'support@careerconnectlesotho.com',
        timezone: 'Africa/Maseru',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        maintenanceMode: false,
        enableRegistration: true,
        enableEmailVerification: true,
        defaultUserRole: 'student',
      },
      security: {
        requireStrongPasswords: true,
        passwordMinLength: 8,
        maxLoginAttempts: 5,
        lockoutDuration: 30,
        sessionTimeout: 60,
        enable2FA: false,
        enableIPWhitelist: false,
        allowedIPs: [],
        enableRateLimiting: true,
        maxRequestsPerMinute: 100,
        enableSecurityHeaders: true,
        enableCORS: true,
      },
      email: {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUsername: '',
        smtpPassword: '',
        smtpEncryption: 'tls',
        fromName: 'Career Connect Lesotho',
        fromEmail: 'noreply@careerconnectlesotho.com',
        enableEmailNotifications: true,
        emailVerificationTemplate: 'default',
        passwordResetTemplate: 'default',
        welcomeEmailTemplate: 'default',
      },
      storage: {
        maxFileSize: 10,
        allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'],
        maxUserStorage: 100,
        enableCompression: true,
        storageProvider: 'firebase',
        backupFrequency: 'daily',
        keepBackupsFor: 30,
        enableAutoCleanup: true,
      },
      api: {
        enableAPI: true,
        apiVersion: 'v1',
        apiRateLimit: 1000,
        requireApiKey: true,
        enableSwagger: true,
        enableWebhooks: true,
        webhookSecret: '',
        apiKeys: [],
      },
      analytics: {
        enableAnalytics: true,
        analyticsProvider: 'firebase',
        trackUserBehavior: true,
        trackPageViews: true,
        trackEvents: true,
        dataRetention: 365,
        enableGDPRCompliance: true,
        anonymizeIP: true,
      },
      notifications: {
        enablePushNotifications: true,
        enableEmailNotifications: true,
        enableSMSNotifications: false,
        notifyNewRegistrations: true,
        notifyFailedLogins: true,
        notifySystemErrors: true,
        notificationSound: true,
        desktopNotifications: false,
      },
    });
    setShowResetModal(false);
    toast.info('Settings reset to defaults');
  };

  const generateApiKey = () => {
    if (!newApiKey.name.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }
    const newKey = {
      id: Date.now().toString(),
      name: newApiKey.name,
      key: `cc_${Math.random().toString(36).substr(2, 24)}_${Date.now().toString(36)}`,
      permissions: newApiKey.permissions,
      created: new Date().toISOString(),
      lastUsed: null,
      status: 'active',
    };
    setSettings((prev) => ({ ...prev, api: { ...prev.api, apiKeys: [...prev.api.apiKeys, newKey] } }));
    setNewApiKey({ name: '', permissions: ['read'] });
    toast.success('New API key generated successfully');
  };

  const revokeApiKey = (keyId) => {
    setSettings((prev) => ({
      ...prev,
      api: {
        ...prev.api,
        apiKeys: prev.api.apiKeys.map((key) => (key.id === keyId ? { ...key, status: 'revoked' } : key)),
      },
    }));
    toast.warning('API key revoked');
  };

  const deleteApiKey = (keyId) => {
    setSettings((prev) => ({
      ...prev,
      api: { ...prev.api, apiKeys: prev.api.apiKeys.filter((key) => key.id !== keyId) },
    }));
    toast.info('API key deleted');
  };

  const handleBackup = async () => {
    const { smtpPassword, ...safeEmailSettings } = settings.email || {};
    const safeApiSettings = {
      ...(settings.api || {}),
      webhookSecret: '',
      apiKeys: (settings.api?.apiKeys || []).map(({ key, ...apiKey }) => ({
        ...apiKey,
        keyMasked: key ? `${String(key).slice(0, 6)}...` : '',
      })),
    };
    const backupData = {
      settings: {
        ...settings,
        email: safeEmailSettings,
        api: safeApiSettings,
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      source: 'admin-system-settings',
    };
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    try {
      const backupFileForCloud = new File([dataBlob], link.download, {
        type: 'application/json',
        lastModified: Date.now(),
      });
      const upload = await cloudinaryService.uploadToCloudinary(
        backupFileForCloud,
        'career-connect/admin/backups',
        {
          tags: ['admin', 'settings', 'backup'],
          context: `uploaded_by=${currentUser?.uid || 'system'}|backup_type=system_settings`,
        }
      );
      if (upload.success) {
        await adminService.media.registerUpload(
          {
            provider: 'cloudinary',
            folder: 'career-connect/admin/backups',
            url: upload.url,
            publicId: upload.public_id,
            resourceType: upload.resource_type || 'raw',
            bytes: upload.bytes,
            format: upload.format,
            purpose: 'system_settings_backup',
          },
          currentUser,
          userProfile
        );
        toast.success('Backup downloaded and stored in Cloudinary');
        return;
      }
      toast.warning('Backup downloaded locally, but Cloudinary upload failed');
    } catch (error) {
      console.warn('Cloudinary backup upload failed:', error);
      toast.warning('Backup downloaded locally, but Cloudinary upload failed');
    }
  };

  const handleRestore = async () => {
    if (!backupFile) {
      toast.error('Please select a backup file');
      return;
    }
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target.result);
          if (!backupData.settings || !backupData.timestamp) {
            toast.error('Invalid backup file format');
            return;
          }
          setSettings(backupData.settings);
          setShowBackupModal(false);
          setBackupFile(null);
          toast.success('Settings restored from backup');
        } catch (error) {
          console.error('Error parsing backup file:', error);
          toast.error('Failed to parse backup file');
        }
      };
      reader.readAsText(backupFile);
    } catch (error) {
      console.error('Error reading backup file:', error);
      toast.error('Failed to read backup file');
    }
  };

  const addAllowedIP = (ip) => {
    if (!ip.trim()) return;
    setSettings((prev) => ({
      ...prev,
      security: { ...prev.security, allowedIPs: [...prev.security.allowedIPs, ip.trim()] },
    }));
  };

  const removeAllowedIP = (index) => {
    setSettings((prev) => ({
      ...prev,
      security: { ...prev.security, allowedIPs: prev.security.allowedIPs.filter((_, i) => i !== index) },
    }));
  };

  const handleSettingChange = (section, field, value) => {
    setSettings((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  if (!hasSuperAdminAccess) {
    return (
      <AdminPageShell title="System Settings" description="Configure and manage system-wide settings" icon={FaCog}>
        <Alert variant="danger">
          Access denied. Only super administrators can view or change system settings.
        </Alert>
      </AdminPageShell>
    );
  }

  if (loading) {
    return (
      <AdminPageShell title="System Settings" description="Configure and manage system-wide settings" icon={FaCog}>
        <div className="py-16 text-center">
          <Spinner />
          <p className="mt-3 text-gray-500 text-sm">Loading system settings...</p>
        </div>
      </AdminPageShell>
    );
  }

  const navItems = [
    { key: 'general', label: 'General', icon: FaCog },
    { key: 'security', label: 'Security', icon: FaShieldAlt },
    { key: 'email', label: 'Email', icon: FaBell },
    { key: 'storage', label: 'Storage', icon: FaDatabase },
    { key: 'api', label: 'API', icon: FaServer },
    { key: 'analytics', label: 'Analytics', icon: FaUsers },
    { key: 'notifications', label: 'Notifications', icon: FaBell },
  ];

  return (
    <AdminPageShell
      title="System Settings"
      description="Configure and manage system-wide settings"
      icon={FaCog}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outlineSecondary" onClick={() => setShowResetModal(true)}>
            <FaUndo className="mr-2" /> Reset
          </Button>
          <Button variant="primary" onClick={saveSettings} disabled={saving}>
            {saving ? (<><Spinner /><span className="ml-2">Saving...</span></>) : (<><FaSave className="mr-2" /> Save Changes</>)}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-4">
            <CardBody className="p-0">
              <nav className="flex flex-col">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-l-4 transition-colors ${
                        active
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon /> {item.label}
                    </button>
                  );
                })}
                <button
                  onClick={() => setShowBackupModal(true)}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <FaCloudUploadAlt /> Backup/Restore
                </button>
              </nav>
            </CardBody>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* General */}
          {activeTab === 'general' && (
            <Card>
              <CardHeader><h5 className="font-semibold flex items-center"><FaCog className="mr-2" /> General Settings</h5></CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Site Name</Label><Input value={settings.general.siteName} onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)} /></div>
                  <div><Label>Site URL</Label><Input type="url" value={settings.general.siteUrl} onChange={(e) => handleSettingChange('general', 'siteUrl', e.target.value)} /></div>
                  <div><Label>Admin Email</Label><Input type="email" value={settings.general.adminEmail} onChange={(e) => handleSettingChange('general', 'adminEmail', e.target.value)} /></div>
                  <div><Label>Support Email</Label><Input type="email" value={settings.general.supportEmail} onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)} /></div>
                  <div>
                    <Label>Timezone</Label>
                    <Select value={settings.general.timezone} onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}>
                      <option value="Africa/Maseru">Africa/Maseru (GMT+2)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Europe/London">Europe/London</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Date Format</Label>
                    <Select value={settings.general.dateFormat} onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Time Format</Label>
                    <Select value={settings.general.timeFormat} onChange={(e) => handleSettingChange('general', 'timeFormat', e.target.value)}>
                      <option value="24h">24 Hour</option>
                      <option value="12h">12 Hour</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Default User Role</Label>
                    <Select value={settings.general.defaultUserRole} onChange={(e) => handleSettingChange('general', 'defaultUserRole', e.target.value)}>
                      <option value="student">Student</option>
                      <option value="company">Company</option>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Switch id="maintenance-mode" label="Maintenance Mode" checked={settings.general.maintenanceMode} onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)} />
                    <Switch id="enable-registration" label="Enable User Registration" checked={settings.general.enableRegistration} onChange={(e) => handleSettingChange('general', 'enableRegistration', e.target.checked)} />
                    <Switch id="enable-email-verification" label="Require Email Verification" checked={settings.general.enableEmailVerification} onChange={(e) => handleSettingChange('general', 'enableEmailVerification', e.target.checked)} />
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader><h5 className="font-semibold flex items-center"><FaShieldAlt className="mr-2" /> Security Settings</h5></CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Password Minimum Length</Label><Input type="number" min="6" max="32" value={settings.security.passwordMinLength} onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))} /></div>
                  <div><Label>Max Login Attempts</Label><Input type="number" min="1" max="10" value={settings.security.maxLoginAttempts} onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))} /></div>
                  <div><Label>Lockout Duration (minutes)</Label><Input type="number" min="1" max="1440" value={settings.security.lockoutDuration} onChange={(e) => handleSettingChange('security', 'lockoutDuration', parseInt(e.target.value))} /></div>
                  <div><Label>Session Timeout (minutes)</Label><Input type="number" min="5" max="1440" value={settings.security.sessionTimeout} onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))} /></div>
                  <div className="md:col-span-2 space-y-2">
                    <Switch id="strong-passwords" label="Require Strong Passwords" checked={settings.security.requireStrongPasswords} onChange={(e) => handleSettingChange('security', 'requireStrongPasswords', e.target.checked)} />
                    <Switch id="enable-2fa" label="Enable Two-Factor Authentication" checked={settings.security.enable2FA} onChange={(e) => handleSettingChange('security', 'enable2FA', e.target.checked)} />
                    <Switch id="enable-ip-whitelist" label="Enable IP Whitelist" checked={settings.security.enableIPWhitelist} onChange={(e) => handleSettingChange('security', 'enableIPWhitelist', e.target.checked)} />
                    <Switch id="enable-rate-limiting" label="Enable Rate Limiting" checked={settings.security.enableRateLimiting} onChange={(e) => handleSettingChange('security', 'enableRateLimiting', e.target.checked)} />
                    <Switch id="enable-security-headers" label="Enable Security Headers" checked={settings.security.enableSecurityHeaders} onChange={(e) => handleSettingChange('security', 'enableSecurityHeaders', e.target.checked)} />
                    <Switch id="enable-cors" label="Enable CORS" checked={settings.security.enableCORS} onChange={(e) => handleSettingChange('security', 'enableCORS', e.target.checked)} />
                  </div>
                  {settings.security.enableIPWhitelist && (
                    <div className="md:col-span-2">
                      <Label>Allowed IP Addresses</Label>
                      <div className="flex mb-2">
                        <input
                          placeholder="Enter IP address (e.g., 192.168.1.1)"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addAllowedIP(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={(e) => {
                            const input = e.target.previousElementSibling;
                            addAllowedIP(input.value);
                            input.value = '';
                          }}
                          className="px-3 py-2 text-sm bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {settings.security.allowedIPs.map((ip, index) => (
                          <Badge key={index} color="bg-blue-100 text-blue-800">
                            {ip}
                            <button
                              type="button"
                              className="ml-2 text-blue-600 hover:text-blue-900"
                              onClick={() => removeAllowedIP(index)}
                            >
                              &times;
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Email */}
          {activeTab === 'email' && (
            <Card>
              <CardHeader><h5 className="font-semibold flex items-center"><FaBell className="mr-2" /> Email Settings</h5></CardHeader>
              <CardBody>
                <Alert variant="warning" className="mb-4">
                  <FaExclamationTriangle className="inline mr-2" />
                  For security, email passwords are not displayed. Enter a new password to update.
                </Alert>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>SMTP Host</Label><Input value={settings.email.smtpHost} onChange={(e) => handleSettingChange('email', 'smtpHost', e.target.value)} /></div>
                  <div><Label>SMTP Port</Label><Input type="number" value={settings.email.smtpPort} onChange={(e) => handleSettingChange('email', 'smtpPort', parseInt(e.target.value))} /></div>
                  <div><Label>SMTP Username</Label><Input value={settings.email.smtpUsername} onChange={(e) => handleSettingChange('email', 'smtpUsername', e.target.value)} /></div>
                  <div>
                    <Label>SMTP Password</Label>
                    <div className="flex">
                      <input
                        type={apiKeyVisible ? 'text' : 'password'}
                        value={settings.email.smtpPassword}
                        onChange={(e) => handleSettingChange('email', 'smtpPassword', e.target.value)}
                        placeholder="Enter new password to update"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => setApiKeyVisible(!apiKeyVisible)}
                        className="px-3 py-2 text-sm bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                      >
                        {apiKeyVisible ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label>Encryption</Label>
                    <Select value={settings.email.smtpEncryption} onChange={(e) => handleSettingChange('email', 'smtpEncryption', e.target.value)}>
                      <option value="tls">TLS</option>
                      <option value="ssl">SSL</option>
                      <option value="none">None</option>
                    </Select>
                  </div>
                  <div><Label>From Name</Label><Input value={settings.email.fromName} onChange={(e) => handleSettingChange('email', 'fromName', e.target.value)} /></div>
                  <div className="md:col-span-2">
                    <Switch id="enable-email-notifications" label="Enable Email Notifications" checked={settings.email.enableEmailNotifications} onChange={(e) => handleSettingChange('email', 'enableEmailNotifications', e.target.checked)} />
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Storage */}
          {activeTab === 'storage' && (
            <Card>
              <CardHeader><h5 className="font-semibold flex items-center"><FaDatabase className="mr-2" /> Storage Settings</h5></CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Maximum File Size (MB)</Label><Input type="number" min="1" max="100" value={settings.storage.maxFileSize} onChange={(e) => handleSettingChange('storage', 'maxFileSize', parseInt(e.target.value))} /></div>
                  <div><Label>Maximum User Storage (MB)</Label><Input type="number" min="10" max="1000" value={settings.storage.maxUserStorage} onChange={(e) => handleSettingChange('storage', 'maxUserStorage', parseInt(e.target.value))} /></div>
                  <div>
                    <Label>Backup Frequency</Label>
                    <Select value={settings.storage.backupFrequency} onChange={(e) => handleSettingChange('storage', 'backupFrequency', e.target.value)}>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </Select>
                  </div>
                  <div><Label>Keep Backups For (days)</Label><Input type="number" min="1" max="365" value={settings.storage.keepBackupsFor} onChange={(e) => handleSettingChange('storage', 'keepBackupsFor', parseInt(e.target.value))} /></div>
                  <div className="md:col-span-2">
                    <Label>Allowed File Types</Label>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'].map((type) => (
                        <label key={type} className="flex items-center gap-1 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={settings.storage.allowedFileTypes.includes(type)}
                            onChange={(e) => {
                              const newTypes = e.target.checked
                                ? [...settings.storage.allowedFileTypes, type]
                                : settings.storage.allowedFileTypes.filter((t) => t !== type);
                              handleSettingChange('storage', 'allowedFileTypes', newTypes);
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                          />
                          .{type}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Switch id="enable-compression" label="Enable File Compression" checked={settings.storage.enableCompression} onChange={(e) => handleSettingChange('storage', 'enableCompression', e.target.checked)} />
                    <Switch id="enable-auto-cleanup" label="Enable Automatic Cleanup" checked={settings.storage.enableAutoCleanup} onChange={(e) => handleSettingChange('storage', 'enableAutoCleanup', e.target.checked)} />
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* API */}
          {activeTab === 'api' && (
            <Card>
              <CardHeader className="flex justify-between items-center">
                <h5 className="font-semibold flex items-center"><FaServer className="mr-2" /> API Settings</h5>
                <Button
                  variant="outlinePrimary"
                  size="sm"
                  onClick={() => document.getElementById('generate-api-key').scrollIntoView({ behavior: 'smooth' })}
                >
                  <FaKey className="mr-2" /> Generate API Key
                </Button>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div><Label>API Version</Label><Input value={settings.api.apiVersion} onChange={(e) => handleSettingChange('api', 'apiVersion', e.target.value)} /></div>
                  <div><Label>Rate Limit (requests per minute)</Label><Input type="number" min="10" max="10000" value={settings.api.apiRateLimit} onChange={(e) => handleSettingChange('api', 'apiRateLimit', parseInt(e.target.value))} /></div>
                  <div className="md:col-span-2 space-y-2">
                    <Switch id="enable-api" label="Enable API" checked={settings.api.enableAPI} onChange={(e) => handleSettingChange('api', 'enableAPI', e.target.checked)} />
                    <Switch id="require-api-key" label="Require API Key" checked={settings.api.requireApiKey} onChange={(e) => handleSettingChange('api', 'requireApiKey', e.target.checked)} />
                    <Switch id="enable-swagger" label="Enable Swagger Documentation" checked={settings.api.enableSwagger} onChange={(e) => handleSettingChange('api', 'enableSwagger', e.target.checked)} />
                    <Switch id="enable-webhooks" label="Enable Webhooks" checked={settings.api.enableWebhooks} onChange={(e) => handleSettingChange('api', 'enableWebhooks', e.target.checked)} />
                  </div>
                </div>

                <Card id="generate-api-key" className="mb-6">
                  <CardHeader><h6 className="font-semibold text-sm">Generate New API Key</h6></CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Key Name</Label>
                        <Input value={newApiKey.name} onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })} placeholder="e.g., Production API Key" />
                      </div>
                      <div>
                        <Label>Permissions</Label>
                        <div className="flex flex-wrap gap-3">
                          {['read', 'write', 'admin'].map((perm) => (
                            <label key={perm} className="flex items-center gap-1 text-sm text-gray-700 capitalize">
                              <input
                                type="checkbox"
                                checked={newApiKey.permissions.includes(perm)}
                                onChange={(e) => {
                                  const perms = e.target.checked
                                    ? [...newApiKey.permissions, perm]
                                    : newApiKey.permissions.filter((p) => p !== perm);
                                  setNewApiKey({ ...newApiKey, permissions: perms });
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                              />
                              {perm}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <Button variant="primary" onClick={generateApiKey} disabled={!newApiKey.name.trim()}>
                          <FaKey className="mr-2" /> Generate API Key
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader><h6 className="font-semibold text-sm">API Keys</h6></CardHeader>
                  <CardBody>
                    {settings.api.apiKeys.length === 0 ? (
                      <Alert variant="info">No API keys generated yet. Generate your first API key above.</Alert>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                            <tr>
                              <th className="px-3 py-2 text-left">Name</th>
                              <th className="px-3 py-2 text-left">Key</th>
                              <th className="px-3 py-2 text-left">Permissions</th>
                              <th className="px-3 py-2 text-left">Created</th>
                              <th className="px-3 py-2 text-left">Status</th>
                              <th className="px-3 py-2 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {settings.api.apiKeys.map((apiKey) => (
                              <tr key={apiKey.id}>
                                <td className="px-3 py-2">{apiKey.name}</td>
                                <td className="px-3 py-2">
                                  <code className="text-xs bg-gray-100 px-2 py-1 rounded block max-w-[200px] truncate">
                                    {apiKeyVisible
                                      ? apiKey.key
                                      : `${String(apiKey.key || '').slice(0, 6)}${apiKey.key ? '...' : ''}`}
                                  </code>
                                </td>
                                <td className="px-3 py-2">
                                  {apiKey.permissions.map((perm) => (
                                    <Badge key={perm} color="bg-cyan-100 text-cyan-800 mr-1">{perm}</Badge>
                                  ))}
                                </td>
                                <td className="px-3 py-2">{new Date(apiKey.created).toLocaleDateString()}</td>
                                <td className="px-3 py-2">
                                  <Badge color={apiKey.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {apiKey.status}
                                  </Badge>
                                </td>
                                <td className="px-3 py-2">
                                  {apiKey.status === 'active' ? (
                                    <Button variant="outlineWarning" size="sm" onClick={() => revokeApiKey(apiKey.id)}>Revoke</Button>
                                  ) : (
                                    <Button variant="outlineDanger" size="sm" onClick={() => deleteApiKey(apiKey.id)}><FaTrash /></Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </CardBody>
            </Card>
          )}

          {/* Analytics */}
          {activeTab === 'analytics' && (
            <Card>
              <CardHeader><h5 className="font-semibold flex items-center"><FaUsers className="mr-2" /> Analytics Settings</h5></CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Analytics Provider</Label>
                    <Select value={settings.analytics.analyticsProvider} onChange={(e) => handleSettingChange('analytics', 'analyticsProvider', e.target.value)}>
                      <option value="firebase">Firebase Analytics</option>
                      <option value="google">Google Analytics</option>
                      <option value="custom">Custom</option>
                    </Select>
                  </div>
                  <div><Label>Data Retention (days)</Label><Input type="number" min="1" max="730" value={settings.analytics.dataRetention} onChange={(e) => handleSettingChange('analytics', 'dataRetention', parseInt(e.target.value))} /></div>
                  <div className="md:col-span-2 space-y-2">
                    <Switch id="enable-analytics" label="Enable Analytics" checked={settings.analytics.enableAnalytics} onChange={(e) => handleSettingChange('analytics', 'enableAnalytics', e.target.checked)} />
                    <Switch id="track-user-behavior" label="Track User Behavior" checked={settings.analytics.trackUserBehavior} onChange={(e) => handleSettingChange('analytics', 'trackUserBehavior', e.target.checked)} />
                    <Switch id="track-page-views" label="Track Page Views" checked={settings.analytics.trackPageViews} onChange={(e) => handleSettingChange('analytics', 'trackPageViews', e.target.checked)} />
                    <Switch id="track-events" label="Track Events" checked={settings.analytics.trackEvents} onChange={(e) => handleSettingChange('analytics', 'trackEvents', e.target.checked)} />
                    <Switch id="enable-gdpr" label="GDPR Compliance" checked={settings.analytics.enableGDPRCompliance} onChange={(e) => handleSettingChange('analytics', 'enableGDPRCompliance', e.target.checked)} />
                    <Switch id="anonymize-ip" label="Anonymize IP Addresses" checked={settings.analytics.anonymizeIP} onChange={(e) => handleSettingChange('analytics', 'anonymizeIP', e.target.checked)} />
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader><h5 className="font-semibold flex items-center"><FaBell className="mr-2" /> Notification Settings</h5></CardHeader>
              <CardBody>
                <div className="space-y-2">
                  <Switch id="enable-push-notifications" label="Enable Push Notifications" checked={settings.notifications.enablePushNotifications} onChange={(e) => handleSettingChange('notifications', 'enablePushNotifications', e.target.checked)} />
                  <Switch id="enable-email-notifications" label="Enable Email Notifications" checked={settings.notifications.enableEmailNotifications} onChange={(e) => handleSettingChange('notifications', 'enableEmailNotifications', e.target.checked)} />
                  <Switch id="enable-sms-notifications" label="Enable SMS Notifications" checked={settings.notifications.enableSMSNotifications} onChange={(e) => handleSettingChange('notifications', 'enableSMSNotifications', e.target.checked)} />
                  <Switch id="notify-new-registrations" label="Notify on New Registrations" checked={settings.notifications.notifyNewRegistrations} onChange={(e) => handleSettingChange('notifications', 'notifyNewRegistrations', e.target.checked)} />
                  <Switch id="notify-failed-logins" label="Notify on Failed Login Attempts" checked={settings.notifications.notifyFailedLogins} onChange={(e) => handleSettingChange('notifications', 'notifyFailedLogins', e.target.checked)} />
                  <Switch id="notify-system-errors" label="Notify on System Errors" checked={settings.notifications.notifySystemErrors} onChange={(e) => handleSettingChange('notifications', 'notifySystemErrors', e.target.checked)} />
                  <Switch id="notification-sound" label="Enable Notification Sound" checked={settings.notifications.notificationSound} onChange={(e) => handleSettingChange('notifications', 'notificationSound', e.target.checked)} />
                  <Switch id="desktop-notifications" label="Enable Desktop Notifications" checked={settings.notifications.desktopNotifications} onChange={(e) => handleSettingChange('notifications', 'desktopNotifications', e.target.checked)} />
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Reset Modal */}
      <Modal show={showResetModal} onHide={() => setShowResetModal(false)}>
        <ModalHeader onClose={() => setShowResetModal(false)}>Reset Settings</ModalHeader>
        <ModalBody>
          <Alert variant="warning" className="mb-3">
            <FaExclamationTriangle className="inline mr-2" />
            Are you sure you want to reset all settings to default values?
          </Alert>
          <p className="text-sm text-gray-600">This action cannot be undone. All custom settings will be lost.</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowResetModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={resetToDefaults}>
            <FaUndo className="mr-2" /> Reset to Defaults
          </Button>
        </ModalFooter>
      </Modal>

      {/* Backup/Restore Modal */}
      <Modal show={showBackupModal} onHide={() => setShowBackupModal(false)} size="lg">
        <ModalHeader onClose={() => setShowBackupModal(false)}>
          <span className="flex items-center"><FaCloudUploadAlt className="mr-2" /> Backup & Restore</span>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><h6 className="font-semibold text-sm">Backup Settings</h6></CardHeader>
              <CardBody className="text-center">
                <FaDatabase size={48} className="text-blue-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-4">Create a backup of all system settings.</p>
                <Button variant="primary" onClick={handleBackup}>
                  <FaCloudUploadAlt className="mr-2" /> Create Backup
                </Button>
              </CardBody>
            </Card>
            <Card>
              <CardHeader><h6 className="font-semibold text-sm">Restore Settings</h6></CardHeader>
              <CardBody>
                <div className="mb-3">
                  <Label>Select Backup File</Label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => setBackupFile(e.target.files[0])}
                    className="w-full text-sm text-gray-700 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Select a previously created backup file (.json)</p>
                </div>
                <Button variant="success" onClick={handleRestore} disabled={!backupFile} className="w-full">
                  <FaSync className="mr-2" /> Restore from Backup
                </Button>
              </CardBody>
            </Card>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowBackupModal(false)}>Close</Button>
        </ModalFooter>
      </Modal>
    </AdminPageShell>
  );
};

export default SystemSettings;