import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) { }

  getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: {
        userId
      }
    });
  }

  getBookmarkById(userId: number, bookmarkId: number) { }

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId: userId,
        ...dto
      }
    });

    return bookmark;
  }

  async editBookmarkById(userId: number, bookmarkId: number, dto: EditBookmarkDto) { }

  deleteBookmarkById(userId: number, bookmarkId: number) { }
}
