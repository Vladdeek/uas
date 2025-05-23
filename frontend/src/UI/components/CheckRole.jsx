import { useEffect } from 'react'

const CheckRole = ({ userRoles, allRoles, setUserRoles }) => {
	const handleRoleChange = role => {
		if (userRoles.includes(role)) {
			setUserRoles(userRoles.filter(r => r !== role))
		} else {
			setUserRoles([...userRoles, role])
		}
	}

	return (
		<div className='fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-sm'>
			{allRoles.map((role, index) => (
				<div key={index} className='flex items-center mb-2'>
					<input
						type='checkbox'
						id={`role-${index}`}
						checked={userRoles.includes(role)}
						onChange={() => handleRoleChange(role)}
						className='mr-2'
					/>
					<label htmlFor={`role-${index}`}>{role}</label>
				</div>
			))}
		</div>
	)
}

export default CheckRole
