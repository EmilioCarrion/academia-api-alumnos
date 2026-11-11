import { NotFoundError } from '../errors/app-error.js';
import { coursesRepository } from '../repositories/courses.repository.js';
import type { CreateCourseInput, ListCoursesQuery, UpdateCourseInput } from '../schemas/course.schema.js';

export const coursesService = {
  listCourses: ({ page, pageSize, categoryId }: ListCoursesQuery) =>
    coursesRepository.findMany({ skip: (page - 1) * pageSize, take: pageSize, categoryId }),

  getCourse: async (id: number) => {
    const course = await coursesRepository.findById(id);
    if (!course) throw new NotFoundError('Course');
    return course;
  },

  createCourse: (data: CreateCourseInput) => coursesRepository.create(data),

  updateCourse: async (id: number, data: UpdateCourseInput) => {
    await coursesService.getCourse(id); // 404 si no existe
    return coursesRepository.update(id, data);
  },

  deleteCourse: async (id: number) => {
    await coursesService.getCourse(id);
    await coursesRepository.delete(id);
  },
};
