<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="userList" border stripe>
        <el-table-column type="index">
        </el-table-column>
        <el-table-column prop="username" label="姓名">
        </el-table-column>
        <el-table-column prop="email" label="邮箱">
        </el-table-column>
        <el-table-column prop="mobile" label="电话">
        </el-table-column>
        <el-table-column prop="role_name" label="角色">
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" active-color="#13ce66" @change="userStateChanged(scope.row.id)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <!-- eslint-disable -->
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="编辑用户" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除用户" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
       :page-sizes="[2,5,10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="增加用户" :visible.sync="addDialogVisible" width="30%" @close="DialogClosed">
      <!--表单区域-->
      <el-form ref="addUserInfoFormRef" label-width="0px" class="userInfo_form" :rules="addUserInfoFormRules" :model="addUserInfo">
        <!--用户名-->
        <el-form-item prop="username">
          <el-input placeholder="请输入用户名" v-model="addUserInfo.username"></el-input>
        </el-form-item>
        <!--密码-->
        <el-form-item prop="password">
          <el-input type="password" placeholder="请输入密码" v-model="addUserInfo.password"></el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input type="email" placeholder="请输入电子邮箱" v-model="addUserInfo.email"></el-input>
        </el-form-item>
        <el-form-item prop="mobile">
          <el-input placeholder="请输入手机号" v-model="addUserInfo.mobile" type="text"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDidlogVisible" width="50%" @closed="editDialogClosed">
      <!--表单区域-->
      <el-form ref="editUserInfoFormRef" label-width="0px" :rules="editUserInfoFormRules" :model="editUserInfo">
        <!--用户名-->
        <el-form-item prop="username">
          <el-input :disabled="true" v-model="editUserInfo.username"></el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input type="email" v-model="editUserInfo.email"></el-input>
        </el-form-item>
        <el-form-item prop="mobile">
          <el-input pl v-model="editUserInfo.mobile" type="text"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDidlogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed()">
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
        <p>分配角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesConfirm()">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>
<script>
export default {
  data() {
    var checkPhone = (rule, value, callback) => {
      const phoneReg = /^1[3|4|5|7|8][0-9]{9}$/
      if (!value) {
        return callback(new Error('电话号码不能为空'))
      }
      setTimeout(() => {
        if (!Number.isInteger(+value)) {
          callback(new Error('请输入数字值'))
        } else {
          if (phoneReg.test(value)) {
            callback()
          } else {
            callback(new Error('电话号码格式不正确'))
          }
        }
      }, 100)
    }
    var checkEmail = (rule, value, callback) => {
      const mailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/
      if (!value) {
        return callback(new Error('‘邮箱不能为空‘'))
      }
      setTimeout(() => {
        if (mailReg.test(value)) {
          callback()
        } else {
          callback(new Error('请输入正确的邮箱格式'))
        }
      }, 100)
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      editDidlogVisible: false,
      setRoleDialogVisible: false,
      userInfo: {},
      rolesList: [],
      addUserInfo: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editUserInfo: {},
      addUserInfoFormRules: {
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { validator: checkEmail, trigger: 'blur' }],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      editUserInfoFormRules: {
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { validator: checkEmail, trigger: 'blur' }],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      selectedRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('/users', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        this.$message.error('获取用户列表失败')
        return
      }
      this.userList = res.data.users
      this.total = res.data.total
      // window.localStorage.setItem('userList', userList)
      // window.localStorage.setItem('total', total)
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    async userStateChanged(userinfo) {
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        this.$message.error('更新用户状态失败')
        userinfo.mg_state = !userinfo.mg_state
        return
      }
      this.$message.success('成功更新用户状态')
    },
    DialogClosed() {
      this.$refs.addUserInfoFormRef.resetFields()
    },
    editDialogClosed() {
      this.$refs.editUserInfoFormRef.resetFields()
    },
    addUser() {
      this.$refs.addUserInfoFormRef.validate(async valia => {
        if (!valia) {
          this.$message.error('请确认信息')
          return
        }
        const { data: res } = await this.$http.post('users', this.userInfo)
        if (res.meta.status !== 201) {
          this.$message.error('添加失败，请稍后添加')
          return
        }
        this.$message.success('添加成功')
        this.addDialogVisible = false
        this.getUserList()
      })
    },
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('查询用户失败')
        return
      }
      this.editUserInfo = res.data
      this.editDidlogVisible = true
    },
    async editUser() {
      this.$refs.editUserInfoFormRef.validate(async valia => {
        if (!valia) {
          this.$message.error('请确认信息')
          return
        }

        const { data: res } = await this.$http.put('users/' + this.editUserInfo.id, {
          email: this.editUserInfo.email,
          mobile: this.editUserInfo.mobile
        })
        if (res.meta.status !== 200) {
          this.$message.error('修改失败，请稍后修改')
          return
        }
        this.$message.success('修改成功')
        this.editDialogVisible = false
        this.getUserList()
      })
    },
    async removeUserById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })

      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete('users/' + id)
        console.log(res)
        if (res.meta.status !== 200) {
          this.$message({
            type: 'error',
            message: '删除失败!'
          })
          return
        }
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getUserList()
      }
    },
    async setRole(userInfo) {
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
    },
    async editRolesConfirm() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分配失败，请稍后再试')
      }
      this.setRoleDialogVisible = true
      this.$message.success('分配成功')
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
  font-size: 12px;
}
</style>
