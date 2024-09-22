// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Utils合约，包含一些实用工具函数
contract Utils {
    // 将字符串转换为bytes32类型
    function stringToBytes32(
        string memory source
    ) internal pure returns (bytes32 result) {
        // 使用汇编语言进行转换
        assembly {
            result := mload(add(source, 32))
        }
    }

    // 将bytes32类型转换为字符串
    function bytes32ToString(bytes32 x) internal pure returns (string memory) {
        // 初始化一些变量用于转换
        bytes memory bytesString = new bytes(32);
        uint256 charCount = 0;
        // 逐字节检查并转换
        for (uint256 j = 0; j < 32; j++) {
            bytes1 char = bytes1(bytes32(uint256(x) * 2 ** (8 * j)));
            if (char != 0) {
                bytesString[charCount] = char;
                charCount++;
            }
        }
        // 截取有效的字符
        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (uint256 j = 0; j < charCount; j++) {
            bytesStringTrimmed[j] = bytesString[j];
        }
        // 返回转换后的字符串
        return string(bytesStringTrimmed);
    }

    // 比较两个字符串是否相等
    function compareStrings(
        string memory a,
        string memory b
    ) internal pure returns (bool) {
        // 使用keccak256哈希函数进行比较
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}

// 用户列表合约，用于管理用户账户
contract UserList is Utils {
    // 存储用户合约的地址
    address[] public userList;
    // 将创建者的地址映射到User合约的地址
    mapping(address => address) public creatorOwnerMap;

    // 创建用户合约
    function createUser(
        address _ProductList,
        string memory userName,
        string memory password,
        bool gender,
        string memory phone
    ) public {
        // 获取调用者的地址作为用户账户
        address ownerAccount = msg.sender;
        // 确保账户未注册
        require(isNotRegistered(ownerAccount), "Account already registered");
        // 创建新的用户合约实例
        address newUser = address(
            new User(
                _ProductList,
                ownerAccount,
                userName,
                password,
                gender,
                phone
            )
        );
        // 将新用户合约的地址添加到列表中
        userList.push(newUser);
        // 在映射中存储创建者地址和新用户合约的地址
        creatorOwnerMap[ownerAccount] = newUser;
    }

    // 获取用户合约地址
    function getUserAddress(address _address) public view returns (address) {
        return creatorOwnerMap[_address];
    }

    // 检查账户是否已注册为用户
    function isNotRegistered(address account) public view returns (bool) {
        // 如果映射值为0，则表示账户未注册
        return creatorOwnerMap[account] == address(0);
    }

    // 验证密码是否正确
    function verifyPwd(
        string memory userName,
        string memory password
    ) public view returns (bool) {
        // 获取调用者的地址
        address creator = msg.sender;
        // 确保调用者已注册为用户
        require(
            !isNotRegistered(creator),
            "Caller not registered as car owner"
        );
        // 获取调用者的用户合约地址
        address contractAddr = creatorOwnerMap[creator];
        // 创建用户合约实例
        User user = User(contractAddr);
        // 比较用户名和密码是否匹配
        return
            compareStrings(user.userName(), userName) &&
            user.pwdRight(password);
    }

    // 获取用户列表
    function getCarownerList() public view returns (address[] memory) {
        // 返回存储的用户合约地址列表
        return userList;
    }

    // 检查地址是否为用户
    function isUser(address ownerAddr) public view returns (bool) {
        // 遍历用户列表，检查是否存在对应的地址
        for (uint256 i = 0; i < userList.length; i++) {
            if (ownerAddr == userList[i]) return true;
        }
        // 如果没有找到对应的地址，则返回false
        return false;
    }

    // 根据用户名获取密码
    function getPasswordHashByUsername(string memory userName) public view returns (string memory) {
        for (uint256 i = 0; i < userList.length; i++) {
            User user = User(userList[i]);
            if (compareStrings(user.userName(), userName)) {
                return user.getPasswordHash();
            }
        }
        revert("User not found");
    }
}

// 用户合约，用于管理用户的信息
contract User is Utils {
    // 存储用户的基本信息和合约地址
    address public owner; // 合约创建者地址
    address public productList; // 商品列表合约地址
    string public userName; // 用户名
    string private password; // 密码（哈希值）
    uint256 private nowBalance; // 当前余额
    bool public gender; // 性别
    string public phone; // 电话号码


    // 只有用户可以调用的修饰符
    modifier ownerOnly() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // 只有用户或系统合约可以调用的修饰符
    modifier ownerOrSystemOnly() {
        require(
            msg.sender == owner ||
                msg.sender == productList,
            "Only owner or system contracts can call this function"
        );
        _;
    }

    // 构造函数，初始化用户合约
    constructor(
        address _ProductList,
        address _owner,
        string memory _userName,
        string memory _pwd,
        bool _gender,
        string memory _phone
    ) {
        // 初始化合约状态变量
        owner = _owner;
        productList = _ProductList;
        userName = _userName;
        password = _pwd;
        nowBalance = 10000; // 初始化余额为10000
        gender = _gender;
        phone = _phone;
    }

    //获取用户地址
    function getOwner() public view returns (address) {
        return owner;
    }

    // 验证密码是否正确
    function pwdRight(string memory _pwd) public view returns (bool) {
        // 比较传入的密码和存储的哈希值
        return keccak256(abi.encodePacked(_pwd)) == keccak256(abi.encodePacked(password));
    }

    // 获取用户余额
    function getBalance() public view ownerOrSystemOnly returns (uint256) {
        // 只有用户或系统合约可以查询余额
        return nowBalance;
    }

    // 修改用户信息
    function modifyOwnerInfo(
        string memory _userName,
        bool _gender,
        string memory _phone
    ) public ownerOnly {
        // 只有用户可以修改自己的信息
        userName = _userName;
        gender = _gender;
        phone = _phone;
    }

    // 更新用户余额
    function updateBalance(int256 increment) public ownerOrSystemOnly {
        // 只有用户或系统合约可以更新余额
        require((int256(nowBalance) + increment) >= 0, "Insufficient balance");
        nowBalance = uint256(int256(nowBalance) + increment);
    }

    // 更新密码
    function updatePassword(string memory newPwd) public ownerOnly {
        // 只有用户可以更新自己的密码
        password = newPwd;
    }

    // 获取用户信息
    function getOwnerInfo()
        public
        view
        returns (string memory, bool, string memory)
    {
        // 返回用户的用户名、性别和电话号码
        return (userName, gender, phone);
    }

    // 获取密码
    function getPasswordHash() public view returns (string memory) {
        return password;
    }

}

// 商家列表合约，用于管理商家的创建和验证
contract MerchantList is Utils {
    // 存储商家合约地址的列表
    address[] public merchantList;
    // 通过创建者地址获取商家合约地址的映射
    mapping(address => address) public creatorMerchantMap;

    // 创建商家合约
    function createMerchant(
        address _ProductList,
        string memory userName,
        string memory password,
        string memory phone,
        string memory merchantNo
    ) public {
        // 获取调用者的地址作为商家账户
        address merchantAccount = msg.sender;
        // 确保账户未注册
        require(isNotRegistered(merchantAccount), "Account already registered");
        // 创建新的商家合约实例
        address newMerchant = address(
            new Merchant(
                _ProductList,
                merchantAccount,
                userName,
                password,
                phone,
                merchantNo
            )
        );
        // 将新商家合约的地址添加到列表中
        merchantList.push(newMerchant);
        // 在映射中存储创建者地址和新商家合约的地址
        creatorMerchantMap[merchantAccount] = newMerchant;
    }

    // 获取商家合约地址
    function getMerchantAddress(address _address) public view returns (address) {
        return creatorMerchantMap[_address];
    }

    // 获取商家列表
    function getMerchantList() public view returns (address[] memory) {
        // 返回存储的商家合约地址列表
        return merchantList;
    }

    // 检查账户是否已注册为商家
    function isNotRegistered(address account) public view returns (bool) {
        // 如果账户还没有创建商家合约，则映射值为0
        return creatorMerchantMap[account] == address(0);
    }

    // 检查地址是否为商家
    function isMerchant(address merchantAddr) public view returns (bool) {
        // 遍历商家列表，判断给定地址是否为商家地址
        for (uint256 i = 0; i < merchantList.length; i++) {
            if (merchantAddr == merchantList[i]) return true;
        }
        return false;
    }

    // 验证密码是否正确
    function verifyPwd(
        string memory userName,
        string memory password
    ) public view returns (bool) {
        // 获取调用者的地址
        address creator = msg.sender;
        // 确保调用者已注册为商家
        require(!isNotRegistered(creator), "Merchant not registered");
        // 获取调用者的商家合约地址
        address contractAddr = creatorMerchantMap[creator];
        // 创建商家合约实例
        Merchant merchant = Merchant(contractAddr);
        // 验证用户名和密码是否正确
        return
            compareStrings(merchant.userName(), userName) &&
            merchant.pwdRight(password);
    }

    // 根据用户名获取密码
    function getPasswordHashByUsername(string memory userName) public view returns (string memory) {
        for (uint256 i = 0; i < merchantList.length; i++) {
            Merchant merchant = Merchant(merchantList[i]);
            if (compareStrings(merchant.userName(), userName)) {
                return merchant.getPasswordHash();
            }
        }
        revert("Merchant not found");
    }
}

// 商家合约，用于管理商家的信息
contract Merchant is Utils {
    // 存储商家的基本信息和合约地址
    address public owner; // 创建商家的地址
    address public productList; // 商品列表合约地址
    string public userName; // 用户名
    string private password; // 密码（哈希值）
    uint256 private nowBalance; // 当前余额
    string public phone; // 电话号码
    string public merchantNo; // 商家编号

    // 构造函数，初始化商家合约
    constructor(
        address _ProductList,
        address _owner,
        string memory _userName,
        string memory _password,
        string memory _phone,
        string memory _merchantNo
    ) {
        // 初始化合约状态变量
        owner = _owner;
        productList = _ProductList;
        userName = _userName;
        password = _password;
        nowBalance = 10000; // 初始化余额为10000
        phone = _phone;
        merchantNo = _merchantNo;
    }

    // 只有商家所有者可以调用的修饰符
    modifier ownerOnly() {
        require(owner == msg.sender, "Only owner can call this function");
        _;
    }

    // 只有商家所有者或系统合约可以调用的修饰符
    modifier ownerOrSystemOnly() {
        require(
            msg.sender == owner ||
                msg.sender == productList,
            "Only owner or system contracts can call this function"
        );
        _;
    }

    //获取商家地址
    function getOwner() public view returns (address) {
        return owner;
    }

    // 修改商家信息
    function modifyMerchantInfo(
        string memory _userName,
        string memory _phone,
        string memory _merchantNo
    ) public ownerOnly {
        // 只有商家所有者可以修改商家信息
        userName = _userName;
        phone = _phone;
        merchantNo = _merchantNo;
    }

    // 更新密码
    function updatePassword(string memory newPwd) public ownerOnly {
        // 只有商家所有者可以更新密码
        password = newPwd;
    }

    // 验证密码
    function pwdRight(string memory _pwd) public view returns (bool) {
        return keccak256(abi.encodePacked(_pwd)) == keccak256(abi.encodePacked(password));
    }

    // 添加商家余额
    function updateBalance(int256 increment) public ownerOrSystemOnly {
        require((int256(nowBalance) + increment) > 0, "Invalid balance");
        nowBalance = uint256(int256(nowBalance) + increment);
    }

    // 获取商家余额
    function getBalance() public view ownerOrSystemOnly returns (uint256) {
        // 只有商家所有者或系统合约可以查询余额
        return nowBalance;
    }

    // 获取商家信息
    function getMerchantInfo()
        public
        view
        returns (string memory, string memory, string memory)
    {
        return (userName, phone, merchantNo);
    }

    // 获取密码
    function getPasswordHash() public view returns (string memory) {
        return password;
    }
}

// 管理员列表合约，用于管理管理员的创建和验证
contract AdminList is Utils {
    // 存储管理员合约地址的列表
    address[] public adminList;
    // 通过创建者地址获取管理员合约地址的映射
    mapping(address => address) public creatorAdminMap;

    // 创建管理员合约
    function createAdmin(
        string memory userName,
        string memory password,
        string memory adminNumber,
        string memory phone,
        bool gender
    ) public {
        // 获取调用者的地址作为管理员账户
        address adminAccount = msg.sender;
        // 确保账户未注册
        require(isNotRegistered(adminAccount), "Account already registered");
        // 创建新的管理员合约实例
        address newAdmin = address(
            new Admin(
                adminAccount,
                userName,
                password,
                adminNumber,
                phone,
                gender
            )
        );
        // 将新管理员合约的地址添加到列表中
        adminList.push(newAdmin);
        // 在映射中存储创建者地址和新管理员合约的地址
        creatorAdminMap[adminAccount] = newAdmin;
    }

    // 获取管理员合约地址
    function getAdminAddress(address _address) public view returns (address) {
        return creatorAdminMap[_address];
    }

    // 检查账户是否已注册为管理员
    function isNotRegistered(address account) public view returns (bool) {
        // 如果账户还没有创建管理员合约，则映射值为0
        return creatorAdminMap[account] == address(0);
    }

    // 验证密码是否正确
    function verifyPwd(
        string memory userName,
        string memory password
    ) public view returns (bool) {
        // 获取调用者的地址
        address creator = msg.sender;
        // 确保调用者已注册为管理员
        require(!isNotRegistered(creator), "Admin not registered");
        // 获取调用者的管理员合约地址
        address contractAddr = creatorAdminMap[creator];
        // 创建管理员合约实例
        Admin admin = Admin(contractAddr);
        // 验证用户名和密码是否正确
        return
            compareStrings(admin.userName(), userName) &&
            admin.pwdRight(password);
    }

    // 验证是否为管理员
    function isAdmin(address adminAddr) public view returns (bool) {
        for (uint256 i = 0; i < adminList.length; i++) {
            if (adminList[i] == adminAddr) return true; // 判断给定地址是否为管理员地址
        }
        return false;
    }

    // 获取管理员列表
    function getAdminList() public view returns (address[] memory) {
        // 返回存储的管理员合约地址列表
        return adminList;
    }

    // 根据用户名获取密码
    function getPasswordHashByUsername(string memory userName) public view returns (string memory) {
        for (uint256 i = 0; i < adminList.length; i++) {
            Admin admin = Admin(adminList[i]);
            if (compareStrings(admin.userName(), userName)) {
                return admin.getPasswordHash();
            }
        }
        revert("Admin not found");
    }
}

// 管理员合约，用于管理管理员的信息
contract Admin is Utils {
    // 存储管理员的基本信息
    address public owner; // 创建合约的地址
    string public userName; // 用户名
    string private password; // 密码（哈希值）
    string public adminNo; // 警号
    string public phone; // 电话号码
    bool public gender; // 性别

    // 只有管理员所有者可以调用的修饰符
    modifier ownerOnly() {
        require(owner == msg.sender, "Only owner can call this function");
        _;
    }

    // 构造函数，初始化管理员合约
    constructor(
        address _owner,
        string memory _name,
        string memory _pwd,
        string memory _adminNo,
        string memory _phone,
        bool _gender
    ) {
        // 初始化合约状态变量
        owner = _owner;
        userName = _name;
        password = _pwd;
        adminNo = _adminNo;
        phone = _phone;
        gender = _gender;
    }

    //获取管理员地址
    function getOwner() public view returns (address) {
        return owner;
    }

    // 修改管理员信息
    function modifyAdminInfo(
        string memory newName,
        string memory _phone,
        bool _gender
    ) public ownerOnly {
        // 只有管理员所有者可以修改管理员信息
        userName = newName;
        phone = _phone;
        gender = _gender;
    }

    // 更新密码
    function updatePassword(string memory newPwd) public ownerOnly {
        // 只有管理员所有者可以更新密码
        password = newPwd;
    }

    // 验证密码是否正确
    function pwdRight(string memory _pwd) public view returns (bool) {
        // 比较传入的密码和存储的哈希值
        return keccak256(abi.encodePacked(_pwd)) == keccak256(abi.encodePacked(password));
    }

    // 获取管理员信息
    function getAdminInfo()
        public
        view
        returns (string memory, string memory, string memory, bool)
    {
        // 返回管理员的用户名、警号、电话号码和性别
        return (userName, adminNo, phone, gender);
    }

    // 获取密码
    function getPasswordHash() public view returns (string memory) {
        return password;
    }
}

// 商品列表合约，用于管理商品
contract ProductList {
    // 存储商品ID的列表
    uint256[] productIds;
    
    mapping(uint256 => Product) products; // 通过ID获取商品的映射
    mapping(address => uint256[]) userFavorites; // 用户对应的收藏夹商品
    mapping(uint256 => Report[]) public productReports; // 商品ID到举报列表的映射
    mapping(address => Transaction[]) public userTransactions; // 用户地址到交易记录列表的映射

    // 定义商品的结构体
    struct Product {
        uint256 Id; // 商品ID
        // address user; // 用户地址
        address merchant; // 商家地址
        string name; // 名称
        string description; // 描述
        string category; // 种类
        uint price; // 价格
        uint quantity; // 数量
        string imageHash; // IPFS 哈希
        uint timestamp; // 上架时间
        bool isValid; // 是否有效
    }

    // 举报信息结构体
    struct Report {
        uint256 productId; // 商品ID
        address reporter; // 举报者
        string reason; // 举报原因
        uint timestamp; // 举报时间戳
    }

    // 交易记录结构体
    struct Transaction {
        address user; // 用户地址
        address merchant; // 商家地址
        uint256 productId; // 商品ID
        uint256 quantity; // 购买数量
        uint256 totalPrice; // 总价格
        uint256 timestamp; // 时间戳
    }

    // 获取商品ID列表
    function getRecordList() public view returns (uint256[] memory) {
        // 返回存储的商品ID列表
        return productIds;
    }

    // 根据ID获取商品信息
    function getProductById(uint256 productId) public view returns (Product memory) {
        // 确保商品存在
        require(existProduct(productId));
        // 获取并返回指定商品的详细信息
        Product storage product = products[productId];
        return product;
    }

    // 根据商家地址查找商品的ID
    function getProductIdsByMerchant(
        address merchant
    ) public view returns (uint256[] memory) {
        // 计算商家地址对应的商品数量
        uint256 k = 0;
        for (uint256 i = 0; i < productIds.length; i++) {
            if (products[productIds[i]].merchant == merchant) k++;
        }
        // 创建一个新的数组用于存储该商家所对应的商品ID
        uint256[] memory result = new uint256[](k);
        k = 0;
        // 遍历商品列表，填充商品ID数组
        for (uint256 i = 0; i < productIds.length; i++) {
            if (products[productIds[i]].merchant == merchant) {
                result[k++] = productIds[i];
            }
        }
        return result;
    }

    // 获取指定商家地址对应方案的商品
    function getProductsByMerchant(address merchantAddr) public view returns (Product[] memory) {
        // 计算符合条件的商品数量
        uint256 k = 0;
        for (uint256 i = 0; i < productIds.length; i++) {
            if (products[productIds[i]].merchant == merchantAddr) {
                k++;
            }
        }

        // 创建一个新的数组用于存储符合条件的商品结构体
        Product[] memory result = new Product[](k);
        k = 0;

        // 遍历所有商品并填充结果数组
        for (uint256 i = 0; i < productIds.length; i++) {
            if (products[productIds[i]].merchant == merchantAddr) {
                result[k] = products[productIds[i]];
                k++;
            }
        }

        return result;
    }

    // 检查商品是否有效
    function existProduct(uint256 productId) internal view returns (bool) {
        // 如果商品的isValid为true，则表示商品存在
        return products[productId].isValid;
    }

    // 获取最后一条商品的ID
    function getLastProductId() public view returns (uint256) {
        // 返回列表中最后一条商品的ID
        return productIds[productIds.length - 1];
    }

    // 商家获取所有商品
    function getAllProducts() public view returns (Product[] memory) {
        // 计算商品的数量
        uint256 k = 0;
        for (uint256 i = 0; i < productIds.length; i++) {
                k++;
        }
        // 创建一个新的数组用于存储有效的商品结构体
        Product[] memory result = new Product[](k);
        k = 0;

        // 遍历商品并填充结果数组
        for (uint256 i = 0; i < productIds.length; i++) {
                result[k] = products[productIds[i]];
                k++;
        }
        return result;
    }

    // // 用户获取所有有效商品
    // function getAllProducts() public view returns (Product[] memory) {
    //     // 计算有效商品的数量
    //     uint256 k = 0;
    //     for (uint256 i = 0; i < productIds.length; i++) {
    //             k++;
    //     }
    //     // 创建一个新的数组用于存储有效的商品结构体
    //     Product[] memory result = new Product[](k);
    //     k = 0;

    //     // 遍历所有商品并填充结果数组
    //     for (uint256 i = 0; i < productIds.length; i++) {
    //             result[k] = products[productIds[i]];
    //             k++;
    //     }
    //     return result;
    // }

    // 用户购买商品
    function purchaseProduct(
        address evaluationListAddr,
        address userListAddr,
        address userAddr,
        uint256 _Id,  //商品ID
        uint _number // 购买数量
    ) public {
        // 确保商品存在即有效
        require(existProduct(_Id), "Product does not exist or is not valid");
        // 获取用户合约实例
        User userContract = User(userAddr);
        // 确保调用者是用户
        require(msg.sender == userContract.owner(), "Caller is not the user");
        // 获取用户列表合约实例
        UserList userList = UserList(userListAddr);
        // 确保用户已注册
        require(userList.isUser(userAddr), "User is not registered");

        // 获取商品实例
        Product storage product = products[_Id];

        // 确保用户余额充足
        require(_number > 0, "The product is not selected");
        uint _price = _number * product.price;
        require(userContract.getBalance() > _price, "Insufficient balance");
        // 获取用户合约实例
        Merchant merchantContract = Merchant(product.merchant);

        // 从用户余额中扣除,增加商家余额
        userContract.updateBalance(-int256(_price));
        merchantContract.updateBalance(int256(_price));
        

        // 更新商品数量
        product.quantity -= _number;
        // 记录用户购买
        // product.user = userAddr;

        // 记录交易历史
        Transaction memory newTransaction = Transaction({
            user: userAddr,
            merchant: product.merchant,
            productId: _Id,
            quantity: _number,
            totalPrice: _price,
            timestamp: block.timestamp
        });
        userTransactions[userAddr].push(newTransaction);
        userTransactions[product.merchant].push(newTransaction);

        EvaluationList evaluationList = EvaluationList(evaluationListAddr);
        // 记录评价，初始化为空
        evaluationList.addEvaluation(address(0), _Id, 0, "", "", false);
        evaluationList.addEvaluation(address(0), _Id, 0, "", "", true);
    }

    // 商家发布商品
    function publishProduct(
        address merchantListAddr, // 商家列表合约地址
        address merchantAddr, // 商家地址
        string memory _name, // 名称
        string memory _description, // 描述
        string memory _category, // 种类
        uint _price, // 价格
        uint _quantity, // 数量
        string memory _imageHash // IPFS 哈希
    ) public {
        // 获取商家合约实例
        Merchant merchantContract = Merchant(merchantAddr);
        // 确保调用者是商家
        require(merchantContract.owner() == msg.sender);
        // 获取商家列表合约实例
        MerchantList merchantList = MerchantList(merchantListAddr);
        // 确保商家已注册
        require(merchantList.isMerchant(merchantAddr));

        // 生成商品ID
        uint256 nowProductId = productIds.length > 0
            ? productIds[productIds.length - 1] + 1
            : 1;
        // 将新商品添加到列表和映射中
        productIds.push(nowProductId);
        // 获取商品实例
        Product storage product = products[nowProductId];
        product.Id = nowProductId;
        // product.user = address(0);
        product.merchant = merchantAddr;
        product.name = _name;
        product.description = _description;
        product.category = _category;
        product.price = _price;
        product.quantity = _quantity;
        product.imageHash = _imageHash;
        product.timestamp = block.timestamp;
        product.isValid = true;
    }

    // 商家下架商品
    function removeProduct(
        address merchantListAddr, // 商家列表合约地址
        address merchantAddr, // 商家地址
        uint256 _Id //商品ID
    ) public {
        // 确保商品存在即有效
        require(existProduct(_Id));
        // 获取商家合约实例
        Merchant merchantContract = Merchant(merchantAddr);
        // 确保调用者是商家
        require(merchantContract.owner() == msg.sender);
        // 获取商家列表合约实例
        MerchantList merchantList = MerchantList(merchantListAddr);
        // 确保商家已注册
        require(merchantList.isMerchant(merchantAddr));
        // 获取商品实例
        Product storage product = products[_Id];

        // 下架商品
        product.isValid = false;
    }

    // 收藏商品
    function addFavorite(uint256 productId) public {
        require(existProduct(productId), "Product does not exist or is not valid");
        userFavorites[msg.sender].push(productId);
    }

    // 取消收藏商品
    function removeFavorite(uint256 productId) public {
        require(existProduct(productId), "Product does not exist or is not valid");

        uint256[] storage favoriteIds = userFavorites[msg.sender];
        for (uint256 i = 0; i < favoriteIds.length; i++) {
            if (favoriteIds[i] == productId) {
                favoriteIds[i] = favoriteIds[favoriteIds.length - 1];
                favoriteIds.pop();
                break;
            }
        }
    }

    // 获取用户收藏的商品
    function getUserFavorites() public view returns (Product[] memory) {
        uint256[] storage favoriteIds = userFavorites[msg.sender];
        Product[] memory result = new Product[](favoriteIds.length);

        for (uint256 i = 0; i < favoriteIds.length; i++) {
            result[i] = products[favoriteIds[i]];
        }

        return result;
    }

    // 举报商品
    function reportProduct(uint256 productId, string memory reason) public {
        require(existProduct(productId), "Product does not exist or is not valid");

        // 创建举报信息
        Report memory newReport = Report({
            productId: productId,
            reporter: msg.sender,
            reason: reason,
            timestamp: block.timestamp
        });

        // 将举报信息添加到商品的举报列表中
        productReports[productId].push(newReport);
    }

    // 获取对应商品的举报信息
    function getProductReports(uint256 productId) public view returns (Report[] memory) {
        return productReports[productId];
    }

    // 获取所有商品的举报信息
    function getAllProductReports() public view returns (Report[] memory) {
        uint256 reportCount = 0;
        for (uint256 i = 0; i < productIds.length; i++) {
            reportCount += productReports[productIds[i]].length;
        }

        Report[] memory allReports = new Report[](reportCount);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < productIds.length; i++) {
            Report[] memory reports = productReports[productIds[i]];
            for (uint256 j = 0; j < reports.length; j++) {
                allReports[currentIndex] = reports[j];
                currentIndex++;
            }
        }

        return allReports;
    }

    // 审核举报并处理（例如，下架商品）
    function evaluationReport(
        address AdminListAddr, // 管理员列表地址
        address AdminAddr, // 管理员地址
        uint256 productId, // 商品id
        bool takeAction // 是否同意
    ) public {
        require(existProduct(productId), "Product does not exist or is not valid");
        // 获取管理员合约实例
        Admin admin = Admin(AdminAddr);
        // 确保调用者是管理员
        require(admin.owner() == msg.sender);
        // 获取管理员列表合约实例
        AdminList adminList = AdminList(AdminListAddr);
        // 确保管理员已注册
        require(adminList.isAdmin(AdminAddr));

        if (takeAction) {
            products[productId].isValid = false; // 下架商品
        }

        // 清空举报信息（假设已经处理）
        delete productReports[productId];
    }

    // 根据用户地址查询交易记录
    function getTransactionHistory(address userAddr) public view returns (Transaction[] memory) {
        return userTransactions[userAddr];
    }

    // 根据用户地址查询交易记录并获取商家地址
    function getMerchantsByUser(address userAddr) public view returns (address[] memory) {
        Transaction[] memory transactions = userTransactions[userAddr];
        address[] memory merchants = new address[](transactions.length);
        for (uint256 i = 0; i < transactions.length; i++) {
            merchants[i] = transactions[i].merchant;
        }
        return merchants;
    }

    // 添加评价
    function addEvaluation(
        address userListAddr, // 用户列表合约地址
        // address merchantListAddr, // 商家列表合约地址
        address evaluationListAddr,
        uint256 productId,
        uint8 rating,
        string memory comment,
        string memory imageHash,
        bool isMerchant
    ) public {
        require(existProduct(productId), "Product does not exist or is not valid");
        require(rating >= 0 && rating <= 5, "Rating must be between 0 and 5");

        // 获取实例化合约
        UserList userList = UserList(userListAddr);
        // MerchantList merchantList = MerchantList(merchantListAddr);
        EvaluationList evaluationList = EvaluationList(evaluationListAddr);

        // 获取商品实例
        Product storage product = products[productId];

        // 检查用户或商家是否参与了交易
        bool isParticipant = false;
        address _userAddr;
        address _merchantAddr = product.merchant;

        if (isMerchant) {
            // 用户评价商家
            _userAddr = userList.getUserAddress(msg.sender);
            if (_userAddr != address(0)) {
                Transaction[] storage transactions = userTransactions[_userAddr];
                for (uint256 i = 0; i < transactions.length; i++) {
                    if (transactions[i].productId == productId && transactions[i].merchant == _merchantAddr) {
                        isParticipant = true;
                        break;
                    }
                }
            }
            isParticipant = true;
        } else {
            // 商家评价用户
            Transaction[] storage transactions = userTransactions[_merchantAddr];
            for (uint256 i = 0; i < transactions.length; i++) {
                if (transactions[i].productId == productId && transactions[i].merchant == _merchantAddr) {
                    _userAddr = transactions[i].user;
                    isParticipant = true;
                    break;
                }
            }
        }

        require(isParticipant, "Only participants of the transaction can add an evaluation");

        if (isMerchant) {
            // 用户评价商家
            evaluationList.addEvaluation(_merchantAddr, productId, rating, comment, imageHash, true);
        } else {
            // 商家评价用户
            evaluationList.addEvaluation(_userAddr, productId, rating, comment, imageHash, false);
        }
    }

    // 获取商家的信用评分
    function getMerchantRating(address evaluationListAddr,address merchantAddr) public view returns (uint256) {
        EvaluationList evaluationList = EvaluationList(evaluationListAddr);
        return evaluationList.getMerchantRating(merchantAddr);
    }

    // 获取消费者的信用评分
    function getUserRating(address evaluationListAddr,address userAddr) public view returns (uint256) {
        EvaluationList evaluationList = EvaluationList(evaluationListAddr);
        return evaluationList.getUserRating(userAddr);
    }

    // // 获取用户评价列表
    // function getUserEvaluations(address evaluationListAddr, address userAddr) public view returns (Evaluation[] memory) {
    //     EvaluationList evaluationList = EvaluationList(evaluationListAddr);
    //     return evaluationList.getUserEvaluations(userAddr);
    // }

    // // 获取商家评价列表
    // function getMerchantEvaluations(address evaluationListAddr, address merchantAddr) public view returns (Evaluation[] memory) {
    //     EvaluationList evaluationList = EvaluationList(evaluationListAddr);
    //     return evaluationList.getMerchantEvaluations(merchantAddr);
    // }
}

// 评价合约，用于管理买卖双方的评价
contract EvaluationList {
    // 评价结构体
    struct Evaluation {
        address evaluationer; // 评价者
        uint256 productId; // 商品ID
        uint8 rating; // 评分（0-5）
        string comment; // 评论
        string imageHash; // 图片哈希（IPFS）
        uint256 timestamp; // 时间戳
    }

    // 用户地址到评价列表的映射
    mapping(address => Evaluation[]) public userEvaluations;

    // 商家地址到评价列表的映射
    mapping(address => Evaluation[]) public merchantEvaluations;

    // 添加评价
    function addEvaluation(
        address evaluationer,
        uint256 productId,
        uint8 rating,
        string memory comment,
        string memory imageHash,
        bool isMerchant
    ) public {
        require(rating >= 0 && rating <= 5, "Rating must be between 0 and 5");

        Evaluation memory newEvaluation = Evaluation({
            evaluationer: evaluationer,
            productId: productId,
            rating: rating,
            comment: comment,
            imageHash: imageHash,
            timestamp: block.timestamp
        });

        if (isMerchant) {
            // 用户评价商家 
            merchantEvaluations[evaluationer].push(newEvaluation);
        } else {
            // 商家评价用户
            userEvaluations[evaluationer].push(newEvaluation);
        }
    }

    // 获取商家的信用评分
    function getMerchantRating(address merchantAddr) public view returns (uint256) {
        Evaluation[] storage evaluations = merchantEvaluations[merchantAddr];
        uint256 totalRating = 0;
        uint256 evaluationCount = evaluations.length;

        for (uint256 i = 0; i < evaluationCount; i++) {
            totalRating += evaluations[i].rating;
        }

        return evaluationCount > 0 ? (totalRating * 10) / evaluationCount : 0;
    }

    // 获取消费者的信用评分
    function getUserRating(address userAddr) public view returns (uint256) {
        Evaluation[] storage evaluations = userEvaluations[userAddr];
        uint256 totalRating = 0;
        uint256 evaluationCount = evaluations.length;

        for (uint256 i = 0; i < evaluationCount; i++) {
            totalRating += evaluations[i].rating;
        }

        return evaluationCount > 0 ? (totalRating * 10) / evaluationCount : 0;
    }

    // 获取用户评价列表
    function getUserEvaluations(address userAddr) public view returns (Evaluation[] memory) {
        return userEvaluations[userAddr];
    }

    // 获取商家评价列表
    function getMerchantEvaluations(address merchantAddr) public view returns (Evaluation[] memory) {
        return merchantEvaluations[merchantAddr];
    }
}

