# code-server-for-texlive
texlive +  code-server (vscode) + Japanese  + LaTeX Workshop > code-server-for-texlive



## build

``` bash
docker build . -t haniokasai/code-server-for-texlive-on-docker
```

## run
```
docker run -it -p 8080:8080 -p 19191:19191 --env PASSWORD="my-strong-password" haniokasai/code-server-for-texlive-on-docker --auth=password
```



## pdf preview

this image can preview of pdf file generated by latex, however, There was a problem with the COPY in the Dockerfile and it does not work copy properly, so we have to add the changes as zip file to the image.

## To integrate to GitHub

Please generate Personal access token which has repo and workflow permission (for personal repositories)

![image-20210502181029882](./README.assets\image-20210502181029882.png)