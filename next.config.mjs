/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/task",
        destination: "/tasks",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
