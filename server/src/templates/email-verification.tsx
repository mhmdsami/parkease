import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface EmailVerificationProps {
  name: string;
  otp: string;
}

export default function EmailVerification({
  name,
  otp,
}: EmailVerificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Email Verification</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[32px]">
              <Img
                src="https://res.cloudinary.com/dvnp5asex/image/upload/f_auto,q_auto/v1/lockout/jiroblzxfwjdv1k8qrn6"
                width="80"
                height="80"
                alt="Lockout"
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black font-semibold">
              Verify your email
            </Heading>
            <Section>
              <Text className="text-[14px] leading-[24px] text-black">
                Hello {name},
              </Text>
              <Text className="text-[14px] leading-[24px] text-black">
                Verify your email address by entering the OTP below.
              </Text>
            </Section>
            <Section className="my-[16px] text-center bg-[#eaeaea] rounded-md">
              <Text className="text-[20px] leading-[24px] text-black font-bold">
                {otp}
              </Text>
            </Section>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-center text-[12px] leading-[24px] text-[#666666]">
              Lockout &copy; 2024
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
