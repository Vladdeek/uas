import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiClient from '../../api/api.js';
import { Loader } from '../../components/common';
import { toast } from 'react-toastify';

// Генерация URL аватара на основе имени пользователя
const generateAvatarUrl = (user) => {
    const initials = user.full_name || user.username;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=820000&color=fff&size=128`;
}

const UserProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUser();
    }, [userId]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            setError(null);
            const userData = await ApiClient.getUserById(userId);
            setUser(userData);
        } catch (error) {
            toast.error('Ошибка при загрузке данных пользователя');
            console.error('Error fetching user:', error);
            setError(error.message || 'Не удалось загрузить данные пользователя.');
            // Optional: Redirect if user not found or not authorized to view
            // if (error.status === 404) navigate('/users', { replace: true }); 
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className='p-6 text-center'>
                <p className='text-red-600 text-xl'>{error}</p>
                <button 
                    onClick={() => navigate(-1)} 
                    className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                >
                    Назад
                </button>
            </div>
        );
    }

    if (!user) {
        return <div className='p-10 text-3xl text-center'>Пользователь не найден.</div>;
    }

    return (
        <div className='p-4 md:p-8 max-w-4xl mx-auto'>
            <button 
                onClick={() => navigate(-1)} 
                className='mb-6 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm'
            >
                &larr; Назад к списку
            </button>
            <div className='flex flex-col gap-10 items-center w-full pt-5'>
                {/* Шапка профиля */}
                <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
                    <div className='flex items-start gap-6'>
                        <img
                            src={generateAvatarUrl(user)}
                            alt={user.full_name || user.username}
                            className='w-32 h-32 rounded-full'
                        />
                        <div className='flex-1'>
                            <h1 className='text-2xl font-bold mb-2'>{user.full_name || user.username}</h1>
                            <div className='flex flex-wrap gap-4 text-gray-600'>
                                {user.roles && user.roles.length > 0 && (
                                    <div className='flex items-center gap-2'>
                                        <img src='/icons/shield-user.svg' alt='roles' className='w-5 h-5' />
                                        <span>{user.roles.join(', ')}</span>
                                    </div>
                                )}
                                {user.email && (
                                    <div className='flex items-center gap-2'>
                                        <img src='/icons/mail.svg' alt='email' className='w-5 h-5' />
                                        <span>{user.email}</span>
                                    </div>
                                )}
                                {user.phone && (
                                    <div className='flex items-center gap-2'>
                                        <img src='/icons/phone.svg' alt='phone' className='w-5 h-5' />
                                        <span>{user.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className='flex items-center'>
                            <span className={`px-3 py-1 rounded-full text-sm ${user.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {user.is_verified ? 'Подтвержден' : 'Не подтвержден'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Основная информация */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Личная информация */}
                    <div className='bg-white rounded-lg shadow-md p-6'>
                        <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                            <img src='/icons/user.svg' alt='' className='w-6 h-6' />
                            Личная информация
                        </h2>
                        <div className='space-y-3'>
                            <InfoRow label='Имя' value={user.profile?.first_name} />
                            <InfoRow label='Фамилия' value={user.profile?.last_name} />
                            <InfoRow label='Отчество' value={user.profile?.middle_name} />
                            <InfoRow label='Дата рождения' value={user.profile?.birth_date} />
                            <InfoRow label='Пол' value={user.profile?.gender} />
                        </div>
                    </div>

                    {/* Учебная/Рабочая информация */}
                    <div className='bg-white rounded-lg shadow-md p-6'>
                        <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                            <img src='/icons/graduation-cap.svg' alt='' className='w-6 h-6' />
                            Учебная/Рабочая информация
                        </h2>
                        <div className='space-y-3'>
                            <InfoRow label='Подразделение' value={user.profile?.department} />
                            <InfoRow label='Должность' value={user.profile?.position} />
                            <InfoRow label='Курс' value={user.profile?.course} />
                            <InfoRow label='Группа' value={user.profile?.group_name} />
                            <InfoRow label='Учебное заведение' value={user.profile?.school} />
                        </div>
                    </div>

                    {/* Системная информация */}
                    <div className='bg-white rounded-lg shadow-md p-6'>
                        <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                            <img src='/icons/lock.svg' alt='' className='w-6 h-6' />
                            Системная информация
                        </h2>
                        <div className='space-y-3'>
                            <InfoRow label='ID пользователя' value={user.id} />
                            <InfoRow label='Логин' value={user.username} />
                            <InfoRow 
                                label='Статус аккаунта' 
                                value={user.is_verified ? 'Подтвержден' : 'Не подтвержден'}
                                className={user.is_verified ? 'text-green-600' : 'text-yellow-600'}
                            />
                        </div>
                    </div>

                    {/* Дополнительная информация */}
                    <div className='bg-white rounded-lg shadow-md p-6'>
                        <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                            <img src='/icons/file-text.svg' alt='' className='w-6 h-6' />
                            Дополнительная информация
                        </h2>
                        <div className='space-y-3'>
                            <InfoRow 
                                label='Роли' 
                                value={user.roles?.join(', ')} 
                                className='font-medium'
                            />
                            {/* Здесь можно добавить другие дополнительные поля */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Компонент для отображения строки информации
const InfoRow = ({ label, value, className = '' }) => {
    if (!value && value !== 0) return null;
    return (
        <div className='flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-100 last:border-0'>
            <span className='text-gray-600 sm:w-1/3'>{label}:</span>
            <span className={`font-medium ${className}`}>{value}</span>
        </div>
    );
};

export default UserProfilePage; 