import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as pactum from "pactum";
import { PrismaService } from "../src/prisma/prisma.service";
import { AppModule } from "../src/app.module";
import { AuthDto } from "../src/auth/dto";
import { EditUserDto } from "../src/user/dto";
import { CreateBookmarkDto, EditBookmarkDto } from "../src/bookmark/dto";

describe("App e2e", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true
    }));

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl("http://localhost:3333");
  });

  afterAll(() => {
    app.close();
  });

  describe("Auth", () => {
    const dto: AuthDto = {
      email: "faris@mail.com",
      password: "123123"
    };

    describe("Signup", () => {
      it("Should throw an error if the email is empty", () => {
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody({
            password: dto.password
          })
          .expectStatus(400)
          .inspect();
      });
      it("Should throw an error if the password is empty", () => {
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody({
            email: dto.email
          })
          .expectStatus(400)
          .inspect();
      });
      it("Should throw an HTTP 400 Bad Request error if the request body is not provided", () => {
        return pactum
          .spec()
          .post("/auth/signup")
          .expectStatus(400)
          .inspect();
      });
      it("Should signup", () => {
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody(dto)
          .expectStatus(201)
          .inspect();
      });
    });
    describe("Signin", () => {
      let accessToken: string;

      it("Should throw an error if the email is empty", () => {
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody({
            password: dto.password
          })
          .expectStatus(400)
          .inspect();
      });
      it("Should throw an error if the password is empty", () => {
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody({
            email: dto.email
          })
          .expectStatus(400)
          .inspect();
      });
      it("Should throw an HTTP 400 Bad Request error if the request body is not provided", () => {
        return pactum
          .spec()
          .post("/auth/signin")
          .expectStatus(400)
          .inspect();
      });
      it("Should signin", () => {
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody(dto)
          .expectStatus(200)
          .stores("userAt", "access_token");
      });
    });
  });

  describe("User", () => {
    describe("Get me (current user)", () => {
      it("Should get current user", () => {
        return pactum
          .spec()
          .get("/users/me")
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .expectStatus(200);
      });
    });
    describe("Edit User", () => {
      it("Should edit current user", () => {
        const dto: EditUserDto = {
          firstName: "Faresh",
          email: "faresh@mail.com"
        };

        return pactum
          .spec()
          .patch("/users/")
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
    });
  });

  describe("Bookmark", () => {
    describe("Get empty bookmark", () => {
      it("Should get a bookmark", () => {
        return pactum
          .spec()
          .get("/bookmarks")
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe("Create bookmark", () => {
      const dto: CreateBookmarkDto = {
        title: "Bookmark for Me",
        description: "",
        link: "https://www.youtube.com/watch?v=GHTA143_b-s"
      };

      it("Should create a bookmark", () => {
        return pactum
          .spec()
          .post("/bookmarks")
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .withBody(dto)
          .expectStatus(201)
          .stores("bookmarkId", "id");
      });
    });
    describe("Get bookmarks", () => {
      it("Should get a bookmark", () => {
        return pactum
          .spec()
          .get("/bookmarks")
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
    describe("Get bookmark by id", () => {
      it("Should get a bookmark by id", () => {
        return pactum
          .spec()
          .get("/bookmarks/{id}")
          .withPathParams("id", "$S{bookmarkId}")
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .expectStatus(200)
          .expectJsonLike({ id: "$S{bookmarkId}" });
      });
    });
    describe("Edit bookmark by id", () => {
      it("Should edit a bookmark by id", () => {
        const dto: EditBookmarkDto = {
          title: "Edited Bookmark",
          description: "...and edited description",
        };
  
        return pactum
          .spec()
          .patch("/bookmarks/{id}")
          .withPathParams("id", "$S{bookmarkId}")
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .withBody(dto)
          .expectStatus(200)
          .expectJsonLike(dto);
      });
    });
    describe("Delete bookmark by id", () => {
      it("Should delete a bookmark by id", () => {
        return pactum
          .spec()
          .delete("/bookmarks/{id}")
          .withPathParams("id", "$S{bookmarkId}")
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .expectStatus(204)
          .inspect();
      });
  
      it("Should get an empty bookmark", () => {
        return pactum
          .spec()
          .get("/bookmarks/{id}")
          .withPathParams("id", "$S{bookmarkId}")
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .expectBody("")
          .inspect();
      });
    });
  });
});

