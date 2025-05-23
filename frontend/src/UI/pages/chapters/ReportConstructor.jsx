import ReportForm from '../../components/ReportForm'

const ReportConstructor = () => {
	return (
		<>
			<div className=' items-center w-full'>
				<div className='flex justify-between items-center'>
					<h1 className='text-4xl font-bold mb-5'>Конструктор отчётов</h1>
					<button className='flex items-center gap-2 text-white bg-[#820000] px-3 pt-1 pb-2 rounded-xl text-2xl font-semibold'>
						<img
							className='h-full invert-100 pt-1'
							src='icons/plus.svg'
							alt=''
						/>
						Новый отчёт
					</button>
				</div>

				<div className='grid grid-cols-4 gap-10'>
					<ReportForm
						form_count_inputs={'N'}
						form_name={'Название отчета'}
						form_description={'Короткое описание отчета'}
						form_role={'Подразделение'}
						form_status={'Статус'}
						form_create={'ДД.ММ.ГГГГ'}
					/>
					<ReportForm
						form_count_inputs={3}
						form_name={'Финансовый отчет за Q1 2024'}
						form_description={'Основные показатели прибыли и убытков'}
						form_role={'Финансовый отдел'}
						form_status={'Статус'}
						form_create={'15.03.2024'}
					/>

					<ReportForm
						form_count_inputs={7}
						form_name={'Анализ продаж по регионам'}
						form_description={'Сравнение эффективности региональных отделов'}
						form_role={'Отдел продаж'}
						form_status={'Статус'}
						form_create={'10.02.2023'}
					/>

					<ReportForm
						form_count_inputs={2}
						form_name={'Отчет по кадровым изменениям'}
						form_description={'Нанятые и уволенные сотрудники за месяц'}
						form_role={'HR-отдел'}
						form_status={'Статус'}
						form_create={'05.05.2024'}
					/>

					<ReportForm
						form_count_inputs={5}
						form_name={'Маркетинговый отчет: эффективность кампаний'}
						form_description={'CTR, конверсии и ROI рекламных каналов'}
						form_role={'Маркетинг'}
						form_status={'Статус'}
						form_create={'22.04.2024'}
					/>

					<ReportForm
						form_count_inputs={4}
						form_name={'Технический аудит серверов'}
						form_description={
							'Загрузка CPU, память, инциденты за последний месяц'
						}
						form_role={'IT-инфраструктура'}
						form_status={'Статус'}
						form_create={'30.12.2023'}
					/>
				</div>
			</div>
		</>
	)
}
export default ReportConstructor
