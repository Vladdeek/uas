import React, { useCallback } from 'react'
import PropTypes from 'prop-types'

// Reuse the avatar URL generation function
const generateAvatarUrl = (user) => {
    const initials = user.full_name || user.username;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=820000&color=fff&size=128`;
}

// Info row component with enhanced styling
const InfoRow = ({ label, value, className = '', icon }) => {
    if (!value && value !== 0) return null;
    return (
        <div className='flex items-start space-x-3 py-3 border-b border-gray-100 last:border-b-0'>
            {icon && (
                <img src={`/icons/${icon}`} alt='' className='w-4 h-4 mt-0.5 text-gray-400' />
            )}
            <div className='flex-1'>
                <span className='text-sm text-gray-600'>{label}:</span>
                <span className={`ml-2 text-sm font-medium text-gray-900 ${className}`}>
                    {Array.isArray(value) ? value.join(', ') : value}
                </span>
            </div>
        </div>
    );
};

// Enhanced section component
const InfoSection = ({ title, icon, children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            {icon && <img src={`/icons/${icon}`} alt='' className='w-5 h-5 mr-2' />}
            {title}
        </h3>
        <div className='space-y-2'>
            {children}
        </div>
    </div>
);

const UserProfileModal = ({ user, onClose }) => {
    if (!user) {
        console.warn('UserProfileModal: user prop is required');
        return null;
    }

    const avatarUrl = generateAvatarUrl(user);
    
    // Memoize the close handler to prevent unnecessary re-renders
    const handleClose = useCallback(() => {
        if (onClose) {
            onClose();
        }
    }, [onClose]);

    // Handle backdrop click to close modal
    const handleBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    }, [handleClose]);

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-20 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#820000] to-[#c10f1a] text-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Профиль пользователя</h2>
                        <button 
                            onClick={handleClose}
                            className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
                            aria-label="Закрыть"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {/* User Header */}
                    <div className="flex items-start space-x-6 mb-8 pb-6 border-b border-gray-200">
                        <img
                            src={avatarUrl}
                            alt={user.full_name || user.username}
                            className="w-24 h-24 rounded-full ring-4 ring-red-100"
                        />
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {user.full_name || user.username}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {user.roles && user.roles.length > 0 ? (
                                    user.roles.map((role, index) => (
                                        <span 
                                            key={index} 
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-[#820000]"
                                        >
                                            {role}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-500">Роли не назначены</span>
                                )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                {user.email && (
                                    <div className="flex items-center">
                                        <img src="/icons/mail.svg" alt="" className="w-4 h-4 mr-1" />
                                        {user.email}
                                    </div>
                                )}
                                {user.phone && (
                                    <div className="flex items-center">
                                        <img src="/icons/phone.svg" alt="" className="w-4 h-4 mr-1" />
                                        {user.phone}
                                    </div>
                                )}
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    user.is_verified 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {user.is_verified ? 'Подтвержден' : 'Не подтвержден'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Information Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <InfoSection title="Личная информация" icon="user.svg">
                            <InfoRow label="Имя" value={user.profile?.first_name} />
                            <InfoRow label="Фамилия" value={user.profile?.last_name} />
                            <InfoRow label="Отчество" value={user.profile?.middle_name} />
                            <InfoRow label="Дата рождения" value={user.profile?.birth_date} />
                            <InfoRow label="Пол" value={user.profile?.gender} />
                        </InfoSection>

                        {/* Academic/Work Information */}
                        <InfoSection title="Учебная/Рабочая информация" icon="graduation-cap.svg">
                            {/* Подразделение - только для сотрудников */}
                            {user.roles?.includes('Сотрудник') && (
                                <InfoRow label="Подразделение" value={user.department_info?.department_name || user.profile?.department} />
                            )}
                            
                            {/* Должность - только для сотрудников */}
                            {user.roles?.includes('Сотрудник') && (
                                <InfoRow label="Должность" value={user.department_info?.role_name || user.profile?.position} />
                            )}
                            
                            {/* Ученая степень - только для преподавателей */}
                            {user.roles?.includes('Преподаватель') && (
                                <InfoRow label="Ученая степень" value={user.profile?.academic_degree} />
                            )}
                            
                            {/* Кафедра - для преподавателей и студентов */}
                            {(user.roles?.includes('Преподаватель') || user.roles?.includes('Студент')) && (
                                <InfoRow label="Кафедра" value={user.profile?.chair} />
                            )}
                            
                            {/* Информация для студентов */}
                            {user.roles?.includes('Студент') && (
                                <>
                                    <InfoRow label="Направление обучения" value={user.profile?.direction} />
                                    <InfoRow label="Курс" value={user.profile?.course} />
                                    <InfoRow label="Группа" value={user.profile?.group_name} />
                                </>
                            )}
                            
                            {/* Школа - только для школьников */}
                            {user.roles?.includes('Школьник') && (
                                <InfoRow label="Учебное заведение" value={user.profile?.school} />
                            )}
                        </InfoSection>

                        {/* System Information */}
                        <InfoSection title="Системная информация" icon="lock.svg">
                            <InfoRow label="ID пользователя" value={user.id} />
                            <InfoRow label="Логин" value={user.username} />
                            <InfoRow 
                                label="Статус аккаунта" 
                                value={user.is_verified ? 'Подтвержден' : 'Не подтвержден'}
                                className={user.is_verified ? 'text-green-600' : 'text-yellow-600'}
                            />
                        </InfoSection>

                        {/* Additional Information */}
                        <InfoSection title="Дополнительная информация" icon="file-text.svg">
                            <InfoRow 
                                label="Назначенные роли" 
                                value={user.roles && user.roles.length > 0 ? user.roles : 'Роли не назначены'} 
                                className="font-medium"
                            />
                            <InfoRow label="Email подтвержден" value={user.is_verified ? 'Да' : 'Нет'} />
                        </InfoSection>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-end">
                        <button 
                            onClick={handleClose}
                            className="px-6 py-2 bg-gradient-to-r from-[#820000] to-[#c10f1a] text-white rounded-lg hover:from-[#a00000] hover:to-[#d11a2a] transition-all duration-200 font-medium"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

UserProfileModal.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        username: PropTypes.string.isRequired,
        full_name: PropTypes.string,
        email: PropTypes.string,
        phone: PropTypes.string,
        is_verified: PropTypes.bool,
        roles: PropTypes.arrayOf(PropTypes.string),
        profile: PropTypes.shape({
            first_name: PropTypes.string,
            last_name: PropTypes.string,
            middle_name: PropTypes.string,
            birth_date: PropTypes.string,
            gender: PropTypes.string,
            department: PropTypes.string,
            position: PropTypes.string,
            course: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            group_name: PropTypes.string,
            school: PropTypes.string,
        }),
    }).isRequired,
    onClose: PropTypes.func.isRequired,
};

export default UserProfileModal; 