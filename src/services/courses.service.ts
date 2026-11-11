import { coursesRepository } from '../repositories/courses.repository.js';
import type { ListCoursesQuery } from '../schemas/course.schema.js';

export const coursesService = {
  listCourses: ({ page, pageSize, categoryId }: ListCoursesQuery) =>
    coursesRepository.findMany({ skip: (page - 1) * pageSize, take: pageSize, categoryId }),

  // Práctica: getCourse (404 si no existe), createCourse, updateCourse, deleteCourse
};
