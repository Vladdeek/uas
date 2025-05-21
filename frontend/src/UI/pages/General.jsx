import SBChapter from '../components/SBChapter'
import Sidebar from '../components/SideBar'
import { useState } from 'react'
import Profile from './chapters/Profile'
import Applications from './chapters/Applications'
import Report from './chapters/Report'

const General = () => {
	const [activeIndex, setActiveIndex] = useState(0)
	const FullName = ['Рязанов', 'Владислав', 'Денисович']
	const colors = [
		'f5b7b1',
		'e8daef',
		'aed6f1',
		'a2d9ce',
		'abebc6',
		'f9e79f',
		'fad7a0',
		'edbb99',
		'',
	]
	const avatar = `https://ui-avatars.com/api/?name=${FullName.slice(0, 2).join(
		'+'
	)}&background=${colors[4]}&color=fff`

	const renderContent = () => {
		switch (activeIndex) {
			case 0:
				return (
					<Profile
						img_path={avatar}
						role='Специалист'
						FullName={FullName.join(' ')}
						username={'vladdeek'}
						BirthDate={'27 сентября 2005 г.'}
						email={'vladryazanov2709@gmail.com'}
						phone={'+7 (990) 052-06-70'}
					/>
				)
			case 1:
				return <Applications />
			case 2:
				return <Report />
			default:
				return null
		}
	}

	return (
		<>
			<Sidebar username={FullName} role={'Специалист'} img_path={avatar}>
				<SBChapter
					icon_name='user.svg'
					chapter_name='Профиль'
					isActive={activeIndex === 0}
					onClick={() => setActiveIndex(0)}
				/>
				<SBChapter
					icon_name='clipboard-check.svg'
					chapter_name='Заявки'
					isActive={activeIndex === 1}
					onClick={() => setActiveIndex(1)}
				/>
				<SBChapter
					icon_name='file-text.svg'
					chapter_name='Отчеты'
					isActive={activeIndex === 2}
					onClick={() => setActiveIndex(2)}
				/>
			</Sidebar>

			<main className='ml-96 p-4'>{renderContent()}</main>
		</>
	)
}

export default General
