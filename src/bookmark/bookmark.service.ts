import { CACHE_MANAGER, ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  private readonly logger = new Logger(BookmarkService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) { }

  async getBookmarks(userId: number) {
    const cachedData = await this.cacheService.get(userId.toString());

    if (cachedData) {
      console.log(`Getting data from cache!`);
      return cachedData;
    }

    const data = await this.prisma.bookmark.findMany({
      where: {
        userId
      }
    });

    await this.cacheService.set(userId.toString(), data);
    console.log('Data set to cache', cachedData);

    return data;
  }

  getBookmarkById(userId: number, bookmarkId: number) {
    return this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      }
    });
  }

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId: userId,
        ...dto
      }
    });

    return bookmark;
  }

  async editBookmarkById(userId: number, bookmarkId: number, dto: EditBookmarkDto) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId
      }
    });

    // Use the logger to log the bookmark
    this.logger.log(`Editing bookmark with ID ${bookmarkId}: ${JSON.stringify(bookmark)}`);

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException("Access to resource denied");
    }

    return this.prisma.bookmark.update({
      where: {
        id: bookmarkId
      },
      data: {
        ...dto
      }
    });
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId
      }
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException("Access to resource denied");
    }

    await this.prisma.bookmark.delete({
      where: {
        id: bookmarkId
      }
    });
  }
}
