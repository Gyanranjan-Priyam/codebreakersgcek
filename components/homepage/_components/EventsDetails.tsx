import Image from "next/image";

export default function EventDetails() {
  return (
    <div className="bg-black">
      {/* Hackathons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center text-white p-6 md:p-12 lg:p-16">
        <div className="flex flex-col items-center justify-center order-2 md:order-1">
          <div className="space-y-4 md:space-y-6 flex flex-col items-center justify-center w-full">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center">
              Hackathons
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-center max-w-full md:max-w-2xl lg:max-w-4xl px-2 md:px-0 text-gray-300 leading-relaxed">
              Join our thrilling hackathons where creativity meets technology.
              Collaborate with fellow enthusiasts to build innovative solutions
              in a competitive yet fun environment. Whether you're a beginner or
              a seasoned coder, our hackathons offer a platform to learn,
              network, and showcase your skills. Prizes and recognition await
              the most inventive projects!
            </p>
          </div>
        </div>
        <div className="order-1 md:order-2 w-full flex justify-center">
          <Image
            src="https://res.cloudinary.com/dw47ib0sh/image/upload/v1764666629/s7sly7mokgzxphzz8i5b.avif"
            width={900}
            height={900}
            alt="Hackathons event"
            className="rounded-lg w-full max-w-md md:max-w-full object-cover"
            priority
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8 items-center bg-black text-white p-8 md:p-16">
        <div>
          <Image
            src="https://res.cloudinary.com/dw47ib0sh/image/upload/v1764667955/dt7bwe0kntn3dzkk1t5z.jpg"
            width={900}
            height={900}
            alt="picture one"
            priority
          />
        </div>
        <div className="flex flex-col items-start justify-center">
          <div className="space-y-6 flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold text-white text-center">
              Ideathon
            </h1>
            <p className="text-center mt-4 max-w-4xl">
              Join our energizing ideathons where imagination drives real-world
              solutions. Work with a team to shape fresh ideas and turn them
              into clear, practical plans. Whether you’re new to brainstorming
              or already comfortable pitching concepts, our ideathons give you
              space to learn, collaborate, and refine your vision. Share your
              ideas, get feedback, and build something worth pursuing.
              Recognition awaits the most promising and well-crafted concepts.
            </p>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8 items-center bg-black text-white p-8 md:p-16">
        <div className="flex flex-col items-center justify-center order-2 md:order-1">
          <div className="space-y-4 md:space-y-6 flex flex-col items-center justify-center w-full">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center">
              9 Locks Challenge
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-center max-w-full md:max-w-2xl lg:max-w-4xl px-2 md:px-0 text-gray-300 leading-relaxed">
              9 Locks is a progressive cryptography and problem-solving event
              built around nine digital puzzles. Each lock challenges you with
              logic, ciphers, algorithms or light coding. Solving one puzzle
              unlocks a clue that guides you to the next. As you advance, the
              challenges become more layered and interconnected. The final lock
              pulls everything together, giving you a complete answer once all
              nine stages are cracked.
            </p>
          </div>
        </div>
        <div className="order-1 md:order-2 w-full flex justify-center">
          <Image
            src="https://res.cloudinary.com/dw47ib0sh/image/upload/v1764667954/kdop1bmze4utoxr3es09.jpg"
            width={900}
            height={900}
            alt="9 Locks Challenge event"
            className="rounded-lg w-full max-w-md md:max-w-full object-cover"
            priority
          />
        </div>
      </div>

      {/* AIThons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center text-white p-6 md:p-12 lg:p-16">
        <div className="order-1 w-full flex justify-center">
          <Image
            src="https://res.cloudinary.com/dw47ib0sh/image/upload/v1764667291/wvnsv9isazjlasxy6fq7.jpg"
            width={900}
            height={900}
            alt="AIThons event"
            className="rounded-lg w-full max-w-md md:max-w-full object-cover"
            priority
          />
        </div>
        <div className="flex flex-col items-center justify-center order-2">
          <div className="space-y-4 md:space-y-6 flex flex-col items-center justify-center w-full">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center">
              AIThons
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-center max-w-full md:max-w-2xl lg:max-w-4xl px-2 md:px-0 text-gray-300 leading-relaxed">
              Join our exciting AIThons where projects powered by generative AI
              go head-to-head. Teams build, refine, and showcase AI models that
              create, predict, or solve problems in fresh ways. Whether you're
              exploring AI for the first time or already deep in model
              development, AIThons offer a space to learn, experiment, and
              compete. Present your work, test it against others, and earn
              recognition for the most impressive and creative AI-driven
              projects.
            </p>
          </div>
        </div>
      </div>

      {/* CodeCheaf */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center text-white p-6 md:p-12 lg:p-16">
        <div className="flex flex-col items-start justify-center">
          <div className="space-y-6 flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold text-white text-center">
              CodeCheaf
            </h1>
            <p className="text-center mt-4 max-w-4xl">
              Join CodeCheaf, a focused coding arena built for sharpening your
              problem-solving skills. You’ll work in a LeetCode-style
              environment filled with challenges that test logic, algorithms,
              and clean coding practices. Whether you’re just starting out or
              prepping for tough interviews, CodeCheaf gives you a place to
              learn, practice, and compete at your own pace. Tackle problems,
              track your progress, and earn recognition for consistent and
              standout performance.
            </p>
          </div>
        </div>
        <div className="order-1 md:order-2 w-full flex justify-center">
          <Image
            src="https://res.cloudinary.com/dw47ib0sh/image/upload/v1764668106/ycy9dx5ijvkjkc2ldjkw.jpg"
            width={900}
            height={900}
            alt="CodeCheaf event"
            className="rounded-lg w-full max-w-md md:max-w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
