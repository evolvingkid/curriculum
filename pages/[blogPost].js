import SiteHeader from "../component/layout/SiteHeader/SiteHeader";
import BlogSpotlight from "../component/layout/BlogPost/BlogSpotlight";
import BlogPost from "../component/layout/BlogPost/BlogPost";
import SectionAuthor from "../component/layout/BlogPost/SectionAuthor";
import SectionRelated from "../component/layout/BlogPost/SectionRelated";
import SectionSwag from "../component/layout/SectionSwag/SectionSwag";
import SiteFooter from "../component/layout/SiteFooter/SiteFooter";
import Head from "next/head";
import PostService from "../services/PostService";
import Cookies from "universal-cookie";

// unsure on using getServerSideProps
// if facing SEO issues refer
// https://andrei-calazans.com/posts/2021-05-06/next-js-when-to-use-get-server-side-props
// https://stackoverflow.com/questions/66294596/nextjs-getstaticprops-and-getserversideprops

export async function getServerSideProps(context) {
  try {
    const slug = context.params.blogPost;
    const response = await PostService.getPostBySlug(slug);
    // console.log(response.data.blog.tags[0]);
    const relatedPostsTag = response.data.blog.tags[0]
      ? response.data.blog.tags[0]
      : "";
    let relatedPostsResponse = "";
    if (relatedPostsTag) {
      relatedPostsResponse = await PostService.getPostByTags(
        relatedPostsTag,
        0
      );
      // console.log(relatedPostsResponse);
    }

    if (!response?.data) {
      return {
        redirect: {
          permanent: false,
          destination: "/404"
        }
      };
    }
    return {
      props: {
        blog: response.data.blog,
        relatedPosts: relatedPostsResponse.posts
      }
    };
  } catch (err) {
    console.log("Error => ", err);
    return {
      redirect: {
        permanent: false,
        destination: "/404"
      }
    };
  }
}

export default function BlogListing({ blog, relatedPosts }) {
  const { html, primaryAuthor, title, bannerImage, createdAt } = blog;
  // console.log(relatedPosts);
  const cookies = new Cookies();
  const userCookie = cookies.get("userNullcast");
  return (
    <>
      <SiteHeader />
      <Head>
        <title> {title}</title>
      </Head>
      <BlogSpotlight
        title={title}
        bannerImage={bannerImage}
        createdAt={createdAt}
        primaryAuthor={primaryAuthor}
      />
      <BlogPost
        userId={userCookie ? userCookie.id : ""}
        token={userCookie ? userCookie.accessToken : ""}
        blog={blog}
        html={html}
      />
      <SectionAuthor primaryAuthor={primaryAuthor} />
      <SectionRelated title="Related Blogs" posts={relatedPosts} />
      <SectionSwag />
      <SiteFooter />
    </>
  );
}
