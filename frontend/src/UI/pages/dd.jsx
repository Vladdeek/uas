const renderContent = () => {
	if (loading) {
		return (
			<div className='h-screen w-full flex items-center justify-center'>
				<Loader1 />
			</div>
		)
	}

	switch (activeIndex) {
		case 0:
			return (
				<Profile
					img_path={getAvatar()}
					role={userRoles.join(', ')}
					FullName={userData?.full_name || 'Пользователь'}
					username={userData?.username || 'username'}
					BirthDate={userData?.birth_date || 'Не указано'}
					email={userData?.email || 'email@example.com'}
					phone={userData?.phone || 'Не указан'}
					userRoles={userRoles}
				/>
			)
		case 1:
			return <Applications />
		case 2:
			return hasRole(['Админ']) ? (
				<Constructor
					onClick={() => setActiveIndex(9)}
					ConstBtn={'Новый отчёт'}
					ConstName={'отчётов'}
					type={forms.length === 0}
				>
					{forms.length === 0 && (
						<div className='h-30 w-full flex items-center justify-center text-3xl select-none cursor-default'>
							<div className='flex gap-2 items-center'>
								<p className='pb-1 opacity-30'>Пусто</p>
							</div>
						</div>
					)}
					{forms.map(form => (
						<Form
							key={form.id}
							form_id={form.id}
							form_name={form.name}
							form_description={form.description}
							form_role={form.responsible}
							form_count_inputs={form.fields.length}
							form_create={form.create}
							form_status={form.status}
							onDelete={handleDeleteForm}
						/>
					))}
				</Constructor>
			) : (
				<AccessDenied />
			)

		case 3:
			return <Schedule userRoles={userRoles} />
		case 4:
			return <div>Учебный план</div>
		case 5:
			return <div>Нагрузка/Поступление</div>
		case 6:
			return <div>Новости</div>
		case 7:
			return <Report chap={'Все отчеты'} />
		case 8:
			return hasRole(['Админ']) ? <Structure /> : <AccessDenied />
		case 9:
			return hasRole(['Админ']) ? (
				<New
					type={'отчеты'}
					setActiveIndex={setActiveIndex}
					setForms={setForms}
				/>
			) : (
				<AccessDenied />
			)
		case 10:
			return hasRole(['Админ']) ? (
				<Constructor
					onClick={() => setActiveIndex(11)}
					ConstBtn={'Новая заявка'}
					ConstName={'заявок'}
					type={forms.length === 0}
				>
					{forms.length === 0 && (
						<div className='h-30 w-full flex items-center justify-center text-3xl select-none cursor-default'>
							<div className='flex gap-2 items-center'>
								<p className='pb-1 opacity-30'>Пусто</p>
							</div>
						</div>
					)}
					{forms.map(form => (
						<Form
							key={form.id}
							form_id={form.id}
							form_name={form.name}
							form_description={form.description}
							form_role={form.responsible}
							form_count_inputs={form.fields.length}
							form_create={form.create}
							form_status={form.status}
							onDelete={handleDeleteForm}
						/>
					))}
				</Constructor>
			) : (
				<AccessDenied />
			)
		case 11:
			return hasRole(['Админ']) ? (
				<New
					type={'заявки'}
					setActiveIndex={setActiveIndex}
					setForms={setForms}
				/>
			) : (
				<AccessDenied />
			)
		default:
			return null
	}
}
