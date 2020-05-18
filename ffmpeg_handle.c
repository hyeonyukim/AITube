//libavutil\common.h에서 아래 상수를 정의하지 않으면
//에러가 발생하도록 했기 때문에 include 이전에 정의해줍니다.
#ifndef __STDC_CONSTANT_MACROS
#define __STDC_CONSTANT_MACROS
#endif // !__STDC_CONSTANT_MACROS

#include <libavformat/avformat.h>
#include <libavcodec/avcodec.h>
#include <libavutil/avutil.h>
#include <stdio.h>
#include <conio.h>
#include <string.h>
#include <Windows.h>

//av_register_all() 메소드가 deprecated라 발생하는 에러 메시지 묵시
#pragma warning(disable : 4996)

#define MAX_BUFFER 1000

void commandParse(char *cmd, int len);
int strSize(char *str, char c);
int url_decode(unsigned char *source, unsigned char *dest);

//해당 프로그램을 컴파일해서 AITUBE 설치 시 bin 폴더에 같이 넣어주고 레지스트리에 해당 프로그램을 등록!
int main(int argc, char *argv[])      
{
	char n;
	char command[MAX_BUFFER];

	//checking parameter
	if (argc == 1) {
		printf("parameter is not enough\n");
		return -1;
	}
	else {
		strcpy(command, argv[1]);
	}
	printf("before parsing : %s\n", command);
	commandParse(command, strlen(command));
	printf("after parsing : %s\n", command);
	
	system(command);
	printf("export가 끝났습니다. 파일은 C:\\download\\에 있습니다.\n");

	scanf_s("%c", &n);
	return 0;
}
//ffmpeg cut 커맨드
//ffmpeg -i in.mp4 -vf "select='between(t,4,6.5)+between(t,17,26)',setpts=N/FRAME_RATE/TB" -af "aselect='between(t,4,6.5)+between(t,17,26)+between(t,74,91)',asetpts=N/SR/TB" out.mp4

//커맨드에 이상한 기호들을 parsing해줍니다. 형식은 아래와 같습니다.
//ztest://-i%20in.mp4%20-f%20mp3%20out.mp3/
void commandParse(char *cmd, int len) {
	//tokens
	char token1[] = "ztest://";
	char head[] = "C:\\PROGRA~2\\AiTube\\bin\\ffmpeg.exe ";	//indicating directory. PROGRA~2 -> program files (x86)
	//buf
	char buf[MAX_BUFFER];
	char tokenBuf[MAX_BUFFER];
	//string variable
	char *ptr = strstr(cmd, token1)+strlen(token1);			//ptr을 "ztest://"뒤로 둡니다.
	int size=-1;
	
	strcpy(buf, head);
	strcat(buf, ptr);
	url_decode(buf, buf);
	strcpy(cmd, buf);
}


int url_decode(unsigned char *source, unsigned char *dest)
{
	int init_cnt = strlen(source);
	int num = 0, i, hexv, index = 0;
	int retval = 0;
	while (*source)
	{
		if (*source == '%')
		{
			num = 0;
			retval = 0;
			for (i = 0; i < 2; i++)
			{
				*source++;
				if (*(source) < ':')
				{
					num = *(source)-48;
				}
				else if (*(source) > '@' && *(source) < '[')
				{
					num = (*(source)-'A') + 10;
				}
				else
				{
					num = (*(source)-'a') + 10;
				}

				if ((16 * (1 - i)))
					num = (num * 16);
				retval += num;
			}
			dest[index] = retval;
			index++;
		}
		else
		{
			dest[index] = *source;
			index++;
		}
		*source++;
		if (index >= init_cnt) {
			break;
		}
	}
	dest[index] = '\0';
	return index;
}
/*
references 
	https://sinsisao.tistory.com/2
	https://kyoko0825.tistory.com/entry/%EC%9C%88%EB%8F%84%EC%9A%B0-10%EC%97%90%EC%84%9C-ffmpeg-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0
	https://stackoverflow.com/questions/50594412/cut-multiple-parts-of-a-video-with-ffmpeg
*/