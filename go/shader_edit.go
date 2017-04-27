package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

func main() {

	cwd, err := os.Getwd()

	if err != nil {
		return
	}

	dataDir, err := filepath.Abs(cwd + "/../../../data/shaders/")

	fmt.Printf("cwd = %s\n", cwd)

	fmt.Printf("dataDir = %s\n", dataDir)

	cmd := exec.Command("code", "-n", dataDir)

	if cmd == nil {
		fmt.Printf("Command 'code' not found!")
		return
	}

	//env := os.Environ()
	//env = append(env, fmt.Sprintf("PATH=%s", cwd))
	//cmd.Env = env
	sysPath := os.Getenv("PATH")
	sysPath = fmt.Sprintf("%s;%s", cwd, sysPath)
	os.Setenv("PATH", sysPath)

	fmt.Printf("sysPath is now: %s\n", sysPath)

	cmd.Start()
	fmt.Printf("Running code %s", cmd.Path)
}
