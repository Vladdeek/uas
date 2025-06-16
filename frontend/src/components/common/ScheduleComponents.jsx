import React from 'react'

export const ScheduleTable = ({ children, LessonTime }) => (
	<div className="border rounded-lg p-4 mb-4">
		<div className="font-semibold text-sm text-gray-600 mb-2">{LessonTime}</div>
		{children}
	</div>
)

export const EmptyScheduleTable = () => (
	<div className="text-gray-400 text-center py-8">
		Нет занятий
	</div>
)

export const ScheduleCard = ({ 
	LessonName, 
	Teacher, 
	lessonType, 
	Auditoria, 
	sub_group, 
	lessonNow 
}) => (
	<div className={`border rounded p-3 mb-2 ${lessonNow ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
		<div className="font-medium">{LessonName}</div>
		<div className="text-sm text-gray-600">{Teacher}</div>
		<div className="text-sm text-gray-500">
			{lessonType} • {Auditoria}
			{sub_group && ` • Подгруппа ${sub_group}`}
		</div>
	</div>
)

export const TeacherScheduleCard = ({ 
	LessonName, 
	Group, 
	lessonType, 
	Auditoria, 
	sub_group, 
	lessonNow 
}) => (
	<div className={`border rounded p-3 mb-2 ${lessonNow ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
		<div className="font-medium">{LessonName}</div>
		<div className="text-sm text-gray-600">
			{Array.isArray(Group) ? Group.join(', ') : Group}
		</div>
		<div className="text-sm text-gray-500">
			{lessonType} • {Auditoria}
			{sub_group && ` • Подгруппа ${sub_group}`}
		</div>
	</div>
) 