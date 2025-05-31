import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from '../components/SideBar'
import SBChapter from '../components/SBChapter'
import Structure from './chapters/Structure'
import UsersAndRoles from './chapters/UsersAndRoles'
import ApiClient from '../../api/api'
import { useNavigate } from 'react-router-dom'

const Main = () => {
    const navigate = useNavigate()
    const [userData, setUserData] = useState(null)

    useEffect(() => {
        const user = ApiClient.getCurrentUser()
        if (!user) {
            navigate('/auth')
            return
        }
        setUserData(user)
    }, [])

    const routes = {
        general: [
            {
                path: '/profile',
                element: <div>Профиль</div>,
                chapter: {
                    name: 'Профиль',
                    icon: 'user.svg'
                }
            },
            {
                path: '/applications',
                element: <div>Заявки</div>,
                chapter: {
                    name: 'Заявки',
                    icon: 'file-lines.svg'
                }
            },
            {
                path: '/reports',
                element: <div>Отчеты</div>,
                chapter: {
                    name: 'Отчеты',
                    icon: 'chart-line.svg'
                }
            },
            {
                path: '/schedule',
                element: <div>Расписание</div>,
                chapter: {
                    name: 'Расписание',
                    icon: 'calendar-days.svg'
                }
            },
            {
                path: '/study-plan',
                element: <div>Учебный план</div>,
                chapter: {
                    name: 'Учебный план',
                    icon: 'book.svg'
                }
            },
            {
                path: '/workload',
                element: <div>Нагрузка</div>,
                chapter: {
                    name: 'Нагрузка',
                    icon: 'chart-simple.svg'
                }
            },
            {
                path: '/news',
                element: <div>Новости</div>,
                chapter: {
                    name: 'Новости',
                    icon: 'newspaper.svg'
                }
            }
        ],
        admin: [
            {
                path: '/structure',
                element: <Structure />,
                chapter: {
                    name: 'Структура',
                    icon: 'diagram-project.svg'
                }
            },
            {
                path: '/users-and-roles',
                element: <UsersAndRoles />,
                chapter: {
                    name: 'Пользователи и роли',
                    icon: 'users.svg'
                }
            },
            {
                path: '/application-constructor',
                element: <div>Конструктор заявок</div>,
                chapter: {
                    name: 'Конструктор заявок',
                    icon: 'file-pen.svg'
                }
            },
            {
                path: '/report-constructor',
                element: <div>Конструктор отчетов</div>,
                chapter: {
                    name: 'Конструктор отчетов',
                    icon: 'chart-pie.svg'
                }
            }
        ]
    }

    const allRoutes = [...routes.general, ...routes.admin]

    if (!userData) return null

    const isAdmin = userData.roles.includes('admin')

    return (
        <div className='flex'>
            <Sidebar
                username={userData.full_name ? userData.full_name.split(' ') : [userData.username]}
                role={userData.roles[0]}
                img_path='icons/user-circle.svg'
            >
                <div className="mb-4">
                    <p className="text-white opacity-50 text-sm ml-2 mb-2">Основные</p>
                    {routes.general.map((route, index) => (
                        <SBChapter
                            key={index}
                            to={route.path}
                            icon={route.chapter.icon}
                            text={route.chapter.name}
                        />
                    ))}
                </div>

                {isAdmin && (
                    <div>
                        <p className="text-white opacity-50 text-sm ml-2 mb-2">Администратор</p>
                        {routes.admin.map((route, index) => (
                            <SBChapter
                                key={index}
                                to={route.path}
                                icon={route.chapter.icon}
                                text={route.chapter.name}
                            />
                        ))}
                    </div>
                )}
            </Sidebar>

            <div className='p-4 sm:ml-96 w-full min-h-screen bg-gray-100'>
                <Routes>
                    <Route path='/' element={<Navigate to='/profile' replace />} />
                    {allRoutes.map((route, index) => (
                        <Route key={index} path={route.path} element={route.element} />
                    ))}
                </Routes>
            </div>
        </div>
    )
}

export default Main 